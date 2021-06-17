const route = require("express").Router;
const user_controller = require("../controllers/user");
const auth_middleware = require("../middlewares/auth");

route.get("/dashboard", auth_middleware.verifyToken, (req, res) => {
  return res.json({ status: true, message: "hello from dashboard" });
});

module.exports = route;
