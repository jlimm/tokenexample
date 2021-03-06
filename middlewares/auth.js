const jwt = require("jsonwebtoken");
const redis_client = require("../redis");

function verifyToken(req, res, next) {
  try {
    // bearer token
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userData = decoded;

    req.token = token;

    //verify blacklisted access token
    redis_client.get("_BL" + decoded.sub.toString(),(err,data)=>{
      if(err) throw err;
      if(data === token){
        return res.status(401).json({
          status: false,
          message: "blacklisted token.",
          data: error,
        });
      }
    })
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
    redis_client.get(decoded.sub.toString(), (err, data) => {
      if (err) throw err;

      if (data === null)
        return res
          .status(401)
          .json({ status: false, message: "Invalid request" });
      if (JSON.parse(data).token !== token) {
        return res.status(401).json({
          status: false,
          message: "Invalid Request. Token is not same in store",
        });
      }
      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: true,
      message: "your session is not valid.",
      data: error,
    });
  }
}

module.exports = {
  verifyToken,
  verifyRefreshToken,
};
