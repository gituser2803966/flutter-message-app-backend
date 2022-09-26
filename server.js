const express = require("express");
const cors = require("cors");
require("dotenv").config();
const createError = require("http-errors");
// require("./helpers/redis_connection");
const connectToMongoDB = require("./helpers/mongodb_connection");

const userRouter = require("./routes/userRouter");

const app = express();

var corsOptions = {
  origin: process.env.BASE_SERVER_URL || "http://192.168.2.9:5000",
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

connectToMongoDB();

app.use("/v1/user", userRouter);

//when user type a route doesn't exist
// it show error
app.use((req, res, next) => {
  return next(createError(404, "this route does not exist."));
});

app.use((err, req, res, next) => {
  return res.json({
    status: err.status || 404,
    message: err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server running on port::::: ${PORT}`);
});
