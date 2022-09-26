const {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwtService");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
// const client = require("../helpers/redis_connection");
var createError = require("http-errors");
const { TTL_ACCESS_TOKEN } = require("../helpers/constant");

// @desc     register User
// @route    v1/user/create
// @access   public
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      throw new createError.BadRequest();
    }
    const existEmail = await User.findOne({ email: email });
    if (existEmail) {
      return res.status(404).json({
        error: "email-already-in-use",
        message: "register failed!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });

    const user = await newUser.save();

    const accessToken = await getAccessToken(user._id);
    const refreshToken = await getRefreshToken(user._id);

    User.findByIdAndUpdate(
      user._id,
      {
        tokens: [
          {
            token: accessToken,
            signedAt: Date.now().toString(),
          },
        ],
      },
      (err, doc) => {
        if (err) return new createError.InternalServerError();
      }
    );

    const userRes = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      isReported: user.isReported,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // client.set(
    //   user._id.toString(),
    //   refreshToken,
    //   // time to left: 1 year
    //   {
    //     EX: 365 * 24 * 60 * 60,
    //   },
    //   (err, reply) => {
    //     if (err) {
    //       // return reject(createError.InternalServerError());
    //       throw new createError.InternalServerError();
    //     }
    //   }
    // );

    return res.status(200).json({
      user: userRes,
      accessToken,
      refreshToken,
      message: "register successfully!",
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
      message: "register failed, server error!!!.",
    });
  }
};

// @desc     Login User
// @route    v1/user/login
// @access   public
const userSignIn = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new createError.BadRequest();
  }

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({
        error: "wrong-email",
        message: "login failed!",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(404).json({
        error: "wrong-password",
        message: "login failed!",
      });
    }
    const accessToken = await getAccessToken(user._id);
    const refreshToken = await getRefreshToken(user._id);

    let oldTokens = user.tokens || [];

    if (oldTokens.length) {
      oldTokens = oldTokens.filter((t) => {
        const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
        if (timeDiff < TTL_ACCESS_TOKEN) {
          return t;
        }
      });
    }

    User.findByIdAndUpdate(
      user._id,
      {
        tokens: [
          ...oldTokens,
          {
            token: accessToken,
            signedAt: Date.now().toString(),
          },
        ],
      },
      (err, doc) => {
        if (err) {
          return new createError.InternalServerError();
        }
      }
    );

    const userRes = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      isReported: user.isReported,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      user: userRes,
      accessToken,
      refreshToken,
      message: "login successfully!",
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
      message: "login failed, server error!!!.",
    });
  }
};

// @desc     signOut User
// @route    v1/user/sign-out
// @access   private
const signOut = async (req, res) => {
  try {
    console.log("signOut");
    const { userId } = req.payload;
    const accessToken = req.headers.authorization;
    const user = await User.findById(userId);

    const newToken = user.tokens.filter((t) => t.token !== accessToken);

    User.findByIdAndUpdate(userId, { tokens: newToken }, (err, doc) => {
      if (err) throw new createError.InternalServerError();
    });

    return res.status(200).json({
      message: "log out success",
      logOutSuccess: true,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(500).json({
        error: err.message,
        message: "JsonWebTokenError!",
        logOutSuccess: false,
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(500).json({
        error: err.message,
        message: "jwt expired!",
        logOutSuccess: false,
      });
    }
    return res.status(500).json({
      error: err,
      message: "signOut failed, server error!!!.",
      logOutSuccess: false,
    });
  }
};

// @desc     verify refreshToken
// @route    v1/user/refresh-token
// @access   public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    console.log(`refreshToken:::::::: ${refreshToken}`);

    if (!refreshToken) {
      throw new createError.BadRequest();
    }
    const { userId } = await verifyRefreshToken(refreshToken);

    const user = await User.findById(userId);

    const accessToken = await getAccessToken(userId);
    const newRefreshToken = await getRefreshToken(userId);
    //get refreshToken from redis
    // client.get(userId, async (err, reply) => {
    //   if (err) throw createError.InternalServerError();
    //   if (reply === refreshToken) {
    //     const newAccessToken = await getAccesstoken(userId);
    //     const newRefreshToken = await getRefreshToken(userId);
    //     return res.status(200).json({
    //       accessToken: newAccessToken,
    //       refreshToken: newRefreshToken,
    //     });
    //   }
    // });

    const userRes = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      isReported: user.isReported,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      user: userRes,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return res.status(500).json({
        error: err.message,
        message: "JsonWebTokenError!",
        success: false,
      });
    }
    if (err.name === "TokenExpiredError") {
      return res.status(500).json({
        error: err.message,
        message: "jwt expired!",
        success: false,
      });
    }
    return res.status(500).json({
      error: err,
      message: "refresh token failed :(, server error!!!.",
      success: false,
    });
  }
};

// @desc     get all User
// @route    v1/user/get-lists
// @access   private
const getAllUser = (req, res) => {
  console.log(req.payload);
  return res.status(200).json({
    message: "get all users",
  });
};

// @desc     get all User
// @route    v1/user/profile
// @access   private
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.payload;
    const user = await User.findById(userId);

    const accessToken = req.headers.authorization;

    const userRes = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      isReported: user.isReported,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      user: userRes,
      accessToken,
      message: "get user profile OK! .",
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

module.exports = {
  getAllUser,
  getUserProfile,
  userSignIn,
  createUser,
  refreshToken,
  signOut,
};
