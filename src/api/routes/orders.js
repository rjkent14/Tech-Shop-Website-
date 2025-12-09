// routes/orders.js
const express = require("express");
const db = require("../../database/query.js");
const router = express.Router();

// CREATE order with payment
// CREATE order with payment
router.post("/", (req, res) => {
  const { userId, cartItems, deliveryAddress, paymentMethod, total } = req.body;
  console.log("Incoming order body:", req.body);
  if (!userId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Missing userId or cartItems" });
  }

  const productIds = cartItems.map((item) => item.product_id);
  const placeholders = productIds.map(() => "?").join(",");

  db.all(
    `SELECT product_id, stock FROM products WHERE product_id IN (${placeholders})`,
    productIds,
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Failed to check stock" });

      const stockMap = {};
      rows.forEach((row) => (stockMap[row.product_id] = row.stock));

      for (const item of cartItems) {
        if (item.quantity > (stockMap[item.product_id] || 0)) {
          return res.status(400).json({
            error: `Not enough stock for product ${item.product_id}`,
          });
        }
      }

      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shipping = subtotal > 50 ? 0 : 9.99;
      const computedTotal = subtotal + shipping;

      if (total && Math.abs(total - computedTotal) > 0.01) {
        return res.status(400).json({ error: "Total mismatch" });
      }

      // ✅ Insert into orders (no payment fields here)
      db.run(
        `INSERT INTO orders (user_id, total_amount, delivery_address, status, created_at) 
         VALUES (?, ?, ?, 'Pending', datetime('now'))`,
        [userId, computedTotal, deliveryAddress || ""],
        function (err) {
          if (err) {
            console.error("Insert order error:", err.message);
            return res.status(500).json({ error: "Failed to create order" });
          }

          const orderId = this.lastID;

          // ✅ Insert items
          const stmt = db.prepare(
            `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`
          );
          cartItems.forEach((item) => {
            stmt.run(orderId, item.product_id, item.quantity, item.price);
            db.run(
              "UPDATE products SET stock = stock - ? WHERE product_id = ?",
              [item.quantity, item.product_id]
            );
          });
          stmt.finalize();

          // ✅ Insert into payments
          db.run(
            `INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, 'Pending')`,
            [orderId, computedTotal, paymentMethod || "card"],
            (err) => {
              if (err) {
                console.error("Insert payment error:", err.message);
                return res
                  .status(500)
                  .json({ error: "Failed to create payment record" });
              }

              res.json({ success: true, orderId });
            }
          );
        }
      );
    }
  );
});



// GET orders for a user
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  db.all(
    `SELECT o.order_id, o.total_amount, o.status, o.created_at,
            oi.product_id, oi.quantity, oi.price, p.name, p.image
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN products p ON oi.product_id = p.product_id
     WHERE o.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});
// CONFIRM payment for an order
router.put("/payments/:orderId/confirm", (req, res) => {
  const { orderId } = req.params;

  db.run(
    `UPDATE payments 
     SET status = 'Paid', paid_at = CURRENT_TIMESTAMP 
     WHERE order_id = ?`,
    [orderId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to confirm payment" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Payment not found for this order" });
      }
      res.json({ message: "Payment confirmed successfully", orderId });
    }
  );
});

//admin

router.get("/", (req, res) => {
  db.all(
    `SELECT o.order_id, o.user_id, o.total_amount, o.status, o.created_at, o.delivery_address,
            oi.product_id, oi.quantity, oi.price, p.name, p.image
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN products p ON oi.product_id = p.product_id
     ORDER BY o.order_id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Group items by order
      const ordersMap = {};
      rows.forEach((row) => {
        if (!ordersMap[row.order_id]) {
          ordersMap[row.order_id] = {
            order_id: row.order_id,
            user_id: row.user_id,
            total_amount: row.total_amount,
            status: row.status,
            created_at: row.created_at,
            delivery_address: row.delivery_address,
            items: [],
          };
        }
        ordersMap[row.order_id].items.push({
          product_id: row.product_id,
          name: row.name,
          quantity: row.quantity,
          price: row.price,
          image: row.image,
        });
      });

      res.json(Object.values(ordersMap));
    }
  );
});

// Update order status (with reasons)
router.put("/:orderId/status", (req, res) => {
  const { orderId } = req.params;
  const { status, cancellation_reason, refund_reason } = req.body;

  // Build the update query dynamically based on provided fields
  let updateFields = [];
  let values = [];

  updateFields.push("status = ?");
  values.push(status);

  if (cancellation_reason !== undefined) {
    updateFields.push("cancellation_reason = ?");
    values.push(cancellation_reason);
  }

  if (refund_reason !== undefined) {
    updateFields.push("refund_reason = ?");
    values.push(refund_reason);
  }

  // Add orderId to values array
  values.push(orderId);

  const updateQuery = `UPDATE orders SET ${updateFields.join(", ")} WHERE order_id = ?`;

  db.run(updateQuery, values, function (err) {
    if (err) {
      console.error("Error updating order:", err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ error: "Order not found" });
    
    res.json({ 
      message: "Order status updated successfully",
      orderId,
      status,
      ...(cancellation_reason && { cancellation_reason }),
      ...(refund_reason && { refund_reason })
    });
  });
});

// Also update the GET orders route to include these fields
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  db.all(
    `SELECT o.order_id, o.total_amount, o.status, o.created_at, o.delivery_address,
            o.cancellation_reason, o.refund_reason,  -- ✅ Include new columns
            oi.product_id, oi.quantity, oi.price, p.name, p.image
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN products p ON oi.product_id = p.product_id
     WHERE o.user_id = ?`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Also update the admin GET all orders route
router.get("/", (req, res) => {
  db.all(
    `SELECT o.order_id, o.user_id, o.total_amount, o.status, o.created_at, o.delivery_address,
            o.cancellation_reason, o.refund_reason,  -- ✅ Include new columns
            oi.product_id, oi.quantity, oi.price, p.name, p.image
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN products p ON oi.product_id = p.product_id
     ORDER BY o.order_id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      // Group items by order
      const ordersMap = {};
      rows.forEach((row) => {
        if (!ordersMap[row.order_id]) {
          ordersMap[row.order_id] = {
            order_id: row.order_id,
            user_id: row.user_id,
            total_amount: row.total_amount,
            status: row.status,
            created_at: row.created_at,
            delivery_address: row.delivery_address,
            cancellation_reason: row.cancellation_reason,  // ✅ Include in response
            refund_reason: row.refund_reason,              // ✅ Include in response
            items: [],
          };
        }
        ordersMap[row.order_id].items.push({
          product_id: row.product_id,
          name: row.name,
          quantity: row.quantity,
          price: row.price,
          image: row.image,
        });
      });

      res.json(Object.values(ordersMap));
    }
  );
});

module.exports = router;
