const redis = require("redis");

// connect to redis
const redis_client = redis.createClient({
  host:process.env.REDIS_HOST,
  port:process.env.REDIS_PORT,
  password:process.env.REDIS_PASSWORD
});

redis_client.on("connect", function () {
  console.log("redis client connected");
});

module.exports = redis_client;