require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();

// middleware
app.use(express.json());

let refreshTokens = [];
// routes
// registration

// login
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "li" && password === "123456") {
    const access_token = jwt.sign(
      { sub: username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TIME }
    );
    const refresh_token = generateRefreshToken(username);
    return res.json({
      status: true,
      message: "login success",
      data: { access_token, refresh_token },
    });
  }
  return res.status(401).json({ status: true, message: "login failed" });
});

app.post("/token", verifyRefreshToken, (req, res) => {
  const username = req.userData.sub;
  const access_token = jwt.sign(
    { sub: username },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TIME }
  );
  const refresh_token = generateRefreshToken(username);
  return res.json({
    status: true,
    message: "success",
    data: { access_token, refresh_token },
  });
});

// dashboard
app.get("/dashboard", verifyToken, (req, res) => {
  return res.json({ status: true, message: "hello from dashboard" });
});

app.get("/logout", verifyToken, (req, res) => {
  const username = req.userData.sub;
  // remove the refreshtoken
  refreshTokens = refreshTokens.filter((x) => x.username !== username);
  return res.json({ status: true, message: "logout success" });
});

// custom middleware
function verifyToken(req, res, next) {
  try {
    // bearer token
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "your session is not valid.",
      data: error,
    });
  }
}

function verifyRefreshToken(req, res, next) {
  const token = req.body.token;
  if (token === null) {
    return res.status(401).json({
      status: false,
      message: "Invalid Request.",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.userData = decoded;

    // verify if token is in store or not
    let storedRefreshToken = refreshTokens.find(
      (x) => x.username === decoded.sub
    );
    if (storedRefreshToken === undefined) {
      return res.status(401).json({
        status: false,
        message: "Invalid Request. Token is not in store",
      });
    }
    if (storedRefreshToken.token !== token) {
      return res.status(401).json({
        status: false,
        message: "Invalid Request. Token is not same in store",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      status: true,
      message: "your session is not valid.",
      data: error,
    });
  }
}

function generateRefreshToken(username) {
  const refresh_token = jwt.sign(
    { sub: username },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TIME }
  );

  let storedRefreshToken = refreshTokens.find((x) => x.username === username);
  if (storedRefreshToken === undefined) {
    // add it
    refreshTokens.push({ username: username, token: refresh_token });
  } else {
    // update it
    refreshTokens[
      refreshTokens.findIndex((x) => x.username === username)
    ].token = refresh_token;
  }

  return refresh_token;
}

app.listen(8888, () => console.log("server is running.."));
