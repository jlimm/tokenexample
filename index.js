require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());

// routes
const auth_routes = require('./routes/auth');

app.use('/api/auth', auth_routes);

// dashboard
app.get("/dashboard", verifyToken, (req, res) => {
  return res.json({ status: true, message: "hello from dashboard" });
});

app.listen(8888, () => console.log("server is running.."));
