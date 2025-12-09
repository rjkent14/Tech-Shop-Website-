// routes/products.js
const express = require("express");
const db = require("../../database/query.js");
const router = express.Router();

// GET all products
router.get("/", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error("Error fetching products:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET all categories
router.get("/categories", (req, res) => {
  db.all("SELECT * FROM categories", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add these routes to your existing products.js file:

// CREATE product
router.post("/", (req, res) => {
  const { name, description, price, stock, image, category_id } = req.body;
  
  console.log("Creating product:", req.body);
  
  if (!name || !price || !stock) {
    return res.status(400).json({ error: "Missing required fields: name, price, and stock are required" });
  }

  // Handle undefined category_id (it won't be in the JSON if it's undefined)
  const finalCategoryId = category_id !== undefined ? category_id : null;

  db.run(
    `INSERT INTO products (name, description, price, stock, image, category_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, description || "", price, stock, image || "/Images/default-product.jpg", finalCategoryId],
    function (err) {
      if (err) {
        console.error("Error creating product:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        product_id: this.lastID,
        name,
        description: description || "",
        price,
        stock,
        image: image || "/Images/default-product.jpg",
        category_id: finalCategoryId
      });
    }
  );
});

// UPDATE product
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image, category_id } = req.body;
  
  console.log("Updating product:", id, req.body);
  
  if (!name || !price || !stock) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Handle undefined category_id
  const finalCategoryId = category_id !== undefined ? category_id : null;

  db.run(
    `UPDATE products 
     SET name = ?, description = ?, price = ?, stock = ?, image = ?, category_id = ?
     WHERE product_id = ?`,
    [name, description || "", price, stock, image || "/Images/default-product.jpg", finalCategoryId, id],
    function (err) {
      if (err) {
        console.error("Error updating product:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product updated successfully" });
    }
  );
});

// DELETE product
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  
  console.log("Deleting product:", id);
  
  db.run(
    `DELETE FROM products WHERE product_id = ?`,
    [id],
    function (err) {
      if (err) {
        console.error("Error deleting product:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    }
  );
});
// DELETE product
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  
  console.log("Deleting product:", id);
  
  db.run(
    `DELETE FROM products WHERE product_id = ?`,
    [id],
    function (err) {
      if (err) {
        console.error("Error deleting product:", err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) return res.status(404).json({ error: "Product not found" });
      res.json({ message: "Product deleted successfully" });
    }
  );
});
module.exports = router;
