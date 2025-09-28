const express = require("express");
const cors = require("cors");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const usersRoutes = require("./routes/users");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", methods: ["GET","POST","PUT","DELETE"] }));

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
