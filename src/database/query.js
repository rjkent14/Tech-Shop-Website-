const sqlite3 = require("sqlite3").verbose();
const path = require("path");
//const fs = require("fs"); // ✅ missing import
// Path to database file
const DB_FILE = path.join(__dirname, "../../public/sql.db");

// Full schema and inserts as a string
const SCHEMA_SQL = `
-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlist;
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
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  review_count INTEGER,
  rating REAL,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Wishlist
CREATE TABLE wishlist (
  wishlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  product_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Orders
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  status TEXT NOT NULL DEFAULT 'Pending',
  total_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivery_address TEXT,
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

-- Default admin (fixed email format)
INSERT OR IGNORE INTO users (email, password, name)
VALUES ('admin@example.com', 'adminpass', 'Administrator');

-- Default categories
INSERT OR IGNORE INTO categories (name) VALUES
('Laptops'), ('Audio'), ('Phones'), ('Cameras'), ('Gaming'), ('Wearables');

-- Default products (let AUTOINCREMENT handle product_id)
INSERT INTO products (category_id, name, price, stock, image, review_count, rating) VALUES
((SELECT category_id FROM categories WHERE name = 'Laptops'), 'MacBook Pro 16-inch with M3 Chip', 2499.99, 1, '/Images/macbook-pro.jpg', 324, 4.8),
((SELECT category_id FROM categories WHERE name = 'Audio'), 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 349.99, 1, '/Images/sony-wh1000xm5.jpg', 892, 4.7),
((SELECT category_id FROM categories WHERE name = 'Phones'), 'iPhone 15 Pro Max 256GB', 1199.99, 1, '/Images/iphone-15-pro-max.jpg', 567, 4.6),
((SELECT category_id FROM categories WHERE name = 'Cameras'), 'Canon EOS R6 Mark II Mirrorless Camera', 2499.99, 0, '/Images/canon-eos-r6.jpg', 156, 4.9),
((SELECT category_id FROM categories WHERE name = 'Gaming'), 'PlayStation 5 Console', 499.99, 1, '/Images/ps5-console.jpg', 1203, 4.5),
((SELECT category_id FROM categories WHERE name = 'Wearables'), 'Apple Watch Series 9 GPS + Cellular 45mm', 499.99, 1, '/Images/apple-watch-series9.jpg', 789, 4.4);

-- Users
INSERT OR IGNORE INTO users (email, password, name)
VALUES 
('admin@example.com', 'adminpass', 'Administrator'),
('mark@gmail.com', '12345', 'Mark'),
('rjkent@gmail.com', '12345', 'Rjkent'),
('gabieta@gmail.com', '12345', 'Gabieta'),
('raphael@gmail.com', '12345', 'Raphael'),
('dylan@gmail.com', '12345', 'Dylan');

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
((SELECT category_id FROM categories WHERE name = 'Wearables'), 'Apple Watch Series 9 GPS + Cellular 45mm', 499.99, 20, '/Images/apple-watch-series9.jpg', 789, 4.4);

-- Orders
-- Mark: 3 MacBook Pro
INSERT INTO orders (user_id, total_amount, status, delivery_address)
VALUES ((SELECT user_id FROM users WHERE email='mark@gmail.com'), 2499.99*3, 'Pending', 'Mark Address');

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES ((SELECT order_id FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email='mark@gmail.com') LIMIT 1),
        (SELECT product_id FROM products WHERE name='MacBook Pro 16-inch with M3 Chip'), 3, 2499.99);

-- Gabieta: 10 Canon EOS R6
INSERT INTO orders (user_id, total_amount, status, delivery_address)
VALUES ((SELECT user_id FROM users WHERE email='gabieta@gmail.com'), 2499.99*10, 'Pending', 'Gabieta Address');

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES ((SELECT order_id FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email='gabieta@gmail.com') LIMIT 1),
        (SELECT product_id FROM products WHERE name='Canon EOS R6 Mark II Mirrorless Camera'), 10, 2499.99);

-- Update product stock to account for orders
UPDATE products SET stock = 20 - 3 WHERE name='MacBook Pro 16-inch with M3 Chip';
UPDATE products SET stock = 20 - 10 WHERE name='Canon EOS R6 Mark II Mirrorless Camera';
`;
//const dbExists = fs.existsSync(DB_FILE);
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

    // Only execute schema if DB didn’t exist before
    
      db.exec(SCHEMA_SQL, (err) => {
        if (err) {
          console.error("Error executing schema SQL:", err.message);
        } else {
          console.log("Database schema initialized successfully.");
        }
      });
    
  }
);

module.exports = db;
