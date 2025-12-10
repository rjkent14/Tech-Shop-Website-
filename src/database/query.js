const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

// Path to database file
const DB_FILE = path.join(__dirname, "../../public/sql.db");

// Full schema and inserts as a string
const SCHEMA_SQL = `
-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  address TEXT,
  preferences TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE categories (
  category_id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);

-- Products
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  review_count INTEGER,
  rating REAL,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Orders
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  status TEXT NOT NULL DEFAULT 'Pending',
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivery_address TEXT,
  cancellation_reason TEXT,
  refund_reason TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Order Items
CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Payments
CREATE TABLE payments (
  payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  paid_at DATETIME,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Default categories
INSERT OR IGNORE INTO categories (name) VALUES
('Laptops'), ('Audio'), ('Phones'), ('Cameras'), ('Gaming'), ('Wearables');

-- Users
INSERT OR IGNORE INTO users (email, password, name) VALUES 
('admin@example.com', 'adminpass', 'Administrator'),
('mark@gmail.com', '12345', 'Mark'),
('rjkent@gmail.com', '12345', 'Rjkent'),
('gabieta@gmail.com', '12345', 'Gabieta'),
('raphael@gmail.com', '12345', 'Raphael'),
('dylan@gmail.com', '12345', 'Dylan'),
('john@example.com', '12345', 'John Doe'),
('mia@example.com', '12345', 'Mia Santos'),
('kevin@example.com', '12345', 'Kevin Cruz'),
('sophia@example.com', '12345', 'Sophia Reyes'),
('louise@example.com', '12345', 'Louise Dee');

-- Categories
INSERT OR IGNORE INTO categories (name) VALUES
('Laptops'), ('Audio'), ('Phones'), ('Cameras'), ('Gaming'), ('Wearables');

-- Products (stock = 20)
INSERT OR IGNORE INTO products (category_id, name, price, stock, image, review_count, rating) VALUES
((SELECT category_id FROM categories WHERE name = 'Laptops'), 'MacBook Pro 16-inch with M3 Chip', 2499.99, 20, '/Images/macbook-pro.jpg', 324, 4.8),
((SELECT category_id FROM categories WHERE name = 'Audio'), 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 349.99, 20, '/Images/sony-wh1000xm5.jpg', 892, 4.7),
((SELECT category_id FROM categories WHERE name = 'Phones'), 'iPhone 15 Pro Max 256GB', 1199.99, 20, '/Images/iphone-15-pro-max.jpg', 567, 4.6),
((SELECT category_id FROM categories WHERE name = 'Cameras'), 'Canon EOS R6 Mark II Mirrorless Camera', 2499.99, 20, '/Images/canon-eos-r6.jpg', 156, 4.9),
((SELECT category_id FROM categories WHERE name = 'Gaming'), 'PlayStation 5 Console', 499.99, 20, '/Images/ps5-console.jpg', 1203, 4.5),
((SELECT category_id FROM categories WHERE name = 'Wearables'), 'Apple Watch Series 9 GPS + Cellular 45mm', 499.99, 20, '/Images/apple-watch-series9.jpg', 789, 4.4),
((SELECT category_id FROM categories WHERE name = 'Laptops'), 
 'ASUS ROG Zephyrus G16 Gaming Laptop', 1799.99, 20, '/Images/asus-rog-g16.jpg', 540, 4.7),
((SELECT category_id FROM categories WHERE name = 'Phones'), 
 'Samsung Galaxy S24 Ultra 512GB', 1399.99, 20, '/Images/galaxy-s24-ultra.jpg', 321, 4.8),
((SELECT category_id FROM categories WHERE name = 'Audio'), 
 'Bose QuietComfort Ultra Headphones', 399.99, 20, '/Images/bose-qc-ultra.jpg', 220, 4.6),
((SELECT category_id FROM categories WHERE name = 'Cameras'), 
 'Sony A7 IV Mirrorless Camera', 2499.99, 20, '/Images/sony-a7iv.jpg', 180, 4.9),
((SELECT category_id FROM categories WHERE name = 'Gaming'), 
 'Xbox Series X Console', 499.99, 20, '/Images/xbox-series-x.jpg', 1450, 4.6),
((SELECT category_id FROM categories WHERE name = 'Wearables'), 
 'Samsung Galaxy Watch 6 Classic', 399.99, 20, '/Images/galaxy-watch6.jpg', 430, 4.5);

-- Orders
-- Mark: 3 MacBook Pro
INSERT OR IGNORE INTO orders (user_id, total_amount, status, delivery_address)
VALUES ((SELECT user_id FROM users WHERE email='mark@gmail.com'), 2499.99*3, 'Pending', 'Mark Address');

INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price)
VALUES ((SELECT order_id FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email='mark@gmail.com') LIMIT 1),
        (SELECT product_id FROM products WHERE name='MacBook Pro 16-inch with M3 Chip'), 3, 2499.99);

-- Gabieta: 10 Canon EOS R6
INSERT OR IGNORE INTO orders (user_id, total_amount, status, delivery_address)
VALUES ((SELECT user_id FROM users WHERE email='gabieta@gmail.com'), 2499.99*10, 'Pending', 'Gabieta Address');

INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price)
VALUES ((SELECT order_id FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email='gabieta@gmail.com') LIMIT 1),
        (SELECT product_id FROM products WHERE name='Canon EOS R6 Mark II Mirrorless Camera'), 10, 2499.99);

-- John: 2 ASUS ROG Zephyrus G16
INSERT OR IGNORE INTO orders (user_id, total_amount, status, delivery_address)
VALUES ((SELECT user_id FROM users WHERE email='john@example.com'), 1799.99 * 2, 'Pending', 'John Address');

INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price)
VALUES (
 (SELECT order_id FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email='john@example.com') ORDER BY order_id DESC LIMIT 1),
 (SELECT product_id FROM products WHERE name='ASUS ROG Zephyrus G16 Gaming Laptop'),
 2, 1799.99
);

-- Mia: 1 Samsung S24 Ultra
INSERT OR IGNORE INTO orders (user_id, total_amount, status, delivery_address)
VALUES ((SELECT user_id FROM users WHERE email='mia@example.com'), 1399.99, 'Pending', 'Mia Address');

INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price)
VALUES (
 (SELECT order_id FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email='mia@example.com') ORDER BY order_id DESC LIMIT 1),
 (SELECT product_id FROM products WHERE name='Samsung Galaxy S24 Ultra 512GB'),
 1, 1399.99
);

-- Kevin: 5 Bose QC Ultra
INSERT OR IGNORE INTO orders (user_id, total_amount, status, delivery_address)
VALUES ((SELECT user_id FROM users WHERE email='kevin@example.com'), 399.99 * 5, 'Pending', 'Kevin Address');

INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, price)
VALUES (
 (SELECT order_id FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email='kevin@example.com') ORDER BY order_id DESC LIMIT 1),
 (SELECT product_id FROM products WHERE name='Bose QuietComfort Ultra Headphones'),
 5, 399.99
);

-- Update product stock to account for orders
UPDATE products SET stock = 20 - 3 WHERE name='MacBook Pro 16-inch with M3 Chip';
UPDATE products SET stock = 20 - 10 WHERE name='Canon EOS R6 Mark II Mirrorless Camera';
`;

// Check if database file exists
const dbExists = fs.existsSync(DB_FILE);

// Open database (creates file if it doesn't exist)
const db = new sqlite3.Database(
  DB_FILE,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Database connection error: " + err.message);
      return;
    }
    console.log("Connected to SQLite database.");

    // Enable foreign key support
    db.run("PRAGMA foreign_keys = ON;", (err) => {
      if (err) console.error("Error enabling foreign keys: " + err.message);
      else console.log("Foreign key constraints enabled.");
    });

    // Only execute schema if DB didn't exist before
    if (!dbExists) {
      db.exec(SCHEMA_SQL, (err) => {
        if (err) {
          console.error("Error executing schema SQL:", err.message);
        } else {
          console.log("Database schema initialized successfully.");
        }
      });
    }
  }
);

module.exports = db;