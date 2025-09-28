// routes/users.js
const express = require("express");
const db = require("../../database/query.js");
const router = express.Router();

// REGISTER
router.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
    if (err) return res.status(500).json({ error: "Internal server error" });
    if (row) return res.status(400).json({ error: "Email already registered" });

    db.run(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, password, email.split("@")[0]],
      function (err) {
        if (err) return res.status(500).json({ error: "Failed to create account" });
        res.json({
          message: "Account created successfully",
          user: { id: this.lastID, email, name: email.split("@")[0], isAdmin: false },
        });
      }
    );
  });
});

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  db.get(
    "SELECT user_id, email, name FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: "Invalid email or password" });

      res.json({
        message: "Login successful",
        user: { id: user.user_id, email: user.email, name: user.name, isAdmin: user.email === "admin@example.com" },
      });
    }
  );
});

// GET user profile
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  db.get(
    "SELECT user_id, email, name, address FROM users WHERE user_id = ?",
    [userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!row) return res.status(404).json({ error: "User not found" });
      res.json(row);
    }
  );
});

// UPDATE user profile
router.put("/:userId", (req, res) => {
  const { userId } = req.params;
  const { name, address, password } = req.body;

  let query = "UPDATE users SET name = ?, address = ? WHERE user_id = ?";
  let params = [name, address, userId];

  if (password && password.trim() !== "") {
    query = "UPDATE users SET name = ?, address = ?, password = ? WHERE user_id = ?";
    params = [name, address, password, userId];
  }

  db.run(query, params, function (err) {
    if (err) return res.status(500).json({ error: "Failed to update profile" });
    res.json({ message: "Profile updated successfully" });
  });
});

module.exports = router;
