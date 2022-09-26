const { createClient } = require("redis");

const redis = createClient();

redis.on("error", (err) => console.log("Redis Client Error: ", err));

redis.on("connect", () => {
  console.log("redis client connected !!!!!!!.");
});

redis.connect();

// client.ready();

// client.on("error", (err) => {
//   console.log("Redis client error ******* *******", err);
// });

// client.ping((err, pong) => {
//   if (err) console.log(err);
//   console.log("pong!!!!!!");
// });

// client.connect(() => {
//   console.log("Redis client connected...!!!!");
// });

module.exports = redis;
