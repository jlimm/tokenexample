const User = require("../models/user");
const redis_client = require("../redis");

async function Register(req, res) {
  // encrypt password
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  try {
    const savedUser = await user.save();
    res.json({ status: true, message: "register success", data: savedUser });
  } catch (error) {
    res
      .status(400)
      .json({ status: false, message: "register failed", data: error });
  }
}

async function Login(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await User.findOne({
      username: username,
      password: password,
    }).exec();
    if (user === null) {
      res
        .status(401)
        .json({ status: false, message: "username or password is not valid" });
    }
    const access_token = jwt.sign(
      { sub: user._id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_TIME }
    );
    const refresh_token = generateRefreshToken(user._id);
    return res.json({
      status: true,
      message: "login success",
      data: { access_token, refresh_token },
    });
  } catch (error) {}

  return res.status(401).json({ status: true, message: "login failed" });
}

function Logout(req, res) {
  const userId = req.userData.sub;
  // remove the refreshtoken
  await redis_client.del(userId.toString());
  // blacklist current access token
  await redis_client.set("_BL" + userId.toString(), token);
  return res.json({ status: true, message: "logout success" });
}

function GetAccessToken(req, res) {
  const userId = req.userData.sub;
  const access_token = jwt.sign(
    { sub: userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TIME }
  );
  const refresh_token = generateRefreshToken(userId);
  return res.json({
    status: true,
    message: "success",
    data: { access_token, refresh_token },
  });
}

function generateRefreshToken(userId) {
  const refresh_token = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TIME }
  );

  redis_client.get(userId.toString(), (err, data) => {
    if (err) throw err;
    redis_client.set(
      userId.toString(),
      JSON.stringify({ token: refresh_token })
    );
  });

  return refresh_token;
}

module.exports = {
  Register,
  Login,
  Logout,
  GetAccessToken
};
