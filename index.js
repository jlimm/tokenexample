require("dotenv").config();
const express = require("express");
const app = express();

const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_LOCAL,{useUnifiedTopology:true, useNewUrlParser:true}, () => console.log("DB connected"));

app.use(express.json());

// routes
const auth_routes = require("./routes/auth");
const user_routes = require("./routes/user");

app.use("/api/auth", auth_routes);
app.use("/api/user", user_routes);

app.listen(8080, () => console.log("server is running.."));
