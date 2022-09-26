const jwt = require("jsonwebtoken");
// const client = require("./redis_connection");

const { TTL_ACCESS_TOKEN, TTL_REFRESH_TOKEN } = require("../helpers/constant");
// //Time to expired of access token = 1 day
// const TTL_ACCESS_TOKEN = 60;
// //Time to expired of refresh token = 1 year
// const TTL_REFRESH_TOKEN = "1y";

const getAccessToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const access_token_secret = process.env.JWT_ACCESS_KEY;
    const options = {
      expiresIn: TTL_ACCESS_TOKEN,
    };
    jwt.sign(payload, access_token_secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const getRefreshToken = async (userId) => {
  return new Promise((resolve, reject) => {
    const payload = { userId };
    const refresh_token_secret = process.env.JWT_REFRESH_KEY;
    const options = {
      expiresIn: TTL_REFRESH_TOKEN,
    };
    jwt.sign(payload, refresh_token_secret, options, (err, token) => {
      if (err) reject(err);
      resolve(token);
    });
  });
};

const verifyRefreshToken = async (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, payload) => {
      if (err) return reject(err);
      resolve(payload);
    });
  });
};

module.exports = {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
};
