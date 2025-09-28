// routes/orders.js
const express = require("express");
const db = require("../../database/query.js");
const router = express.Router();

// CREATE order
router.post("/", (req, res) => {
  const { userId, cartItems, deliveryAddress } = req.body;
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
      const total = subtotal + shipping;

      db.run(
        "INSERT INTO orders (user_id, total_amount, delivery_address, status) VALUES (?, ?, ?, ?)",
        [userId, total, deliveryAddress || "", "Pending"],
        function (err) {
          if (err) return res.status(500).json({ error: "Failed to create order" });

          const orderId = this.lastID;
          const stmt = db.prepare(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)"
          );

          cartItems.forEach((item) => {
            stmt.run(orderId, item.product_id, item.quantity, item.price);
            db.run(
              "UPDATE products SET stock = stock - ? WHERE product_id = ?",
              [item.quantity, item.product_id]
            );
          });
          stmt.finalize();

          res.json({ message: "Order placed successfully", orderId });
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

module.exports = router;
