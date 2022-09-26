const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI || "undefine_mongo_url";

const connectToDB = () => {
  // Prints "MongoServerError: bad auth Authentication failed."
  mongoose
    .connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => {
      console.log("connect to db successfully");
    })
    .catch((err) => console.log(err.reason));
};

module.exports = connectToDB;
