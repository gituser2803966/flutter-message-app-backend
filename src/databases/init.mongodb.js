const mongoose = require("mongoose");

const mongodb_uri = process.env.MONGODB_URI;

// Prints "MongoServerError: bad auth Authentication failed."
mongoose
  .connect(mongodb_uri, {
    serverSelectionTimeoutMS: 5000,
  })
  .then((_) => {
    console.log("connected to mongodb successfully.");
  })
  .catch((err) => console.log(`:::::connect error ${err}`));

module.exports = mongoose;
