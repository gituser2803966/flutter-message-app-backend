const jwt = require("jsonwebtoken");
const createError = require("http-errors");

const isAuth = async (req, res, next) => {
  try {
    if (!req.headers["authorization"]) {
      console.log("unauthorized");
      return res.status(403).json({
        error: "unauthorized",
        message: "unauthorized access!",
      });
    }
    const bearerToken = req.headers["authorization"].split(" ");
    const accesstoken = bearerToken[1];
    const accessTokenSecret = process.env.JWT_ACCESS_KEY;
    jwt.verify(accesstoken, accessTokenSecret, (err, payload) => {
      if (err) throw err;
      req.payload = payload;
      req.headers.authorization = accesstoken;
      next();
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(500).json({
        error: err.message,
        message: "JsonWebTokenError!",
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(500).json({
        error: err.message,
        message: "jwt expired!",
      });
    }
    return res.status(500).json({
      error: err,
      message: "get user profile failed! .",
    });
  }
};

module.exports = isAuth;
