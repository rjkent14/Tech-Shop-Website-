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

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
