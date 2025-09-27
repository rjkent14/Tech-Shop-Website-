const express = require("express");
const cors = require("cors");
const db = require("../database/query.js"); // adjust if path is different

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Vite dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// GET products
app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error("Error fetching products:", err.message);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// GET categories
app.get("/api/categories", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});


app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.get(
    "SELECT user_id, email, name FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

     
      const isAdmin = user.email === "admin@example.com";

      res.json({
        message: "Login successful",
        user: {
          id: user.user_id,
          email: user.email,
          name: user.name,
          isAdmin,
        },
      });
    }
  );
});
// CREATE ORDER
// CREATE ORDER with stock check + deduction
app.post("/api/orders", (req, res) => {
  const { userId, cartItems, deliveryAddress } = req.body;
    console.log("Incoming order payload:", req.body); // 👈 debug
  if (!userId || !cartItems || cartItems.length === 0) {
    return res.status(400).json({ error: "Missing userId or cartItems" });
  }

  const productIds = cartItems.map((item) => item.product_id); // 👈 use product_id
  const placeholders = productIds.map(() => "?").join(",");

  db.all(
    `SELECT product_id, stock FROM products WHERE product_id IN (${placeholders})`,
    productIds,
    (err, rows) => {
      if (err) {
        console.error("Error checking stock:", err.message);
        return res.status(500).json({ error: "Failed to check stock" });
      }

      const stockMap = {};
      rows.forEach((row) => {
        stockMap[row.product_id] = row.stock;
      });

      for (const item of cartItems) {
        const currentStock = stockMap[item.product_id] ?? 0;
        if (item.quantity > currentStock) {
          return res.status(400).json({
            error: `Not enough stock for product ${item.product_id}. Available: ${currentStock}, requested: ${item.quantity}`,
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
          if (err) {
            console.error("Error creating order:", err.message);
            return res.status(500).json({ error: "Failed to create order" });
          }

          const orderId = this.lastID;

          const stmt = db.prepare(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)"
          );

          cartItems.forEach((item) => {
            stmt.run(orderId, item.product_id, item.quantity, item.price);

            db.run(
              "UPDATE products SET stock = stock - ? WHERE product_id = ?",
              [item.quantity, item.product_id],
              (err) => {
                if (err) console.error("Error updating stock:", err.message);
              }
            );
          });

          stmt.finalize();

          res.json({ message: "Order placed successfully", orderId });
        }
      );
    }
  );
});


// GET all orders for a user
app.get("/api/orders/:userId", (req, res) => {
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
      if (err) {
        console.error("Error fetching orders:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});
// REGISTER user
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Prevent duplicate emails
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
      console.error("Register check error:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (row) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Insert new user
    db.run(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, password, email.split("@")[0]], // default name = prefix of email
      function (err) {
        if (err) {
          console.error("Register insert error:", err.message);
          return res.status(500).json({ error: "Failed to create account" });
        }

        res.json({
          message: "Account created successfully",
          user: {
            id: this.lastID,
            email,
            name: email.split("@")[0],
            isAdmin: false,
          },
        });
      }
    );
  });
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
