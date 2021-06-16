const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

// middleware
app.use(express.json());
// routes
// registration

// login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "li" && password === "123456") {
    const access_token = jwt.sign({ sub: username }, );
    return res.json({ status: true, message: "login success" });
  }
  return res.status(401).json({ status: true, message: "login failed" });
});

app.listen(8888, () => console.log("server is running.."));
