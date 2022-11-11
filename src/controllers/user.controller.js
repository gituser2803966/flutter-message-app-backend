const {
  getAccessToken,
  getRefreshToken,
  verifyRefreshToken,
} = require("../services/jwt.service");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
let createError = require("http-errors");
const { TTL_ACCESS_TOKEN } = require("../utils/constant");

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

    const fullName = firstName + "" + lastName;

    let name_tags = fullName.split("").map(function (item) {
      return item.trim();
    });

    const newUser = new User({
      firstName,
      lastName,
      name_tags,
      email,
      password: passwordHash,
    });

    const user = await newUser.save();

    //add contact as clone of user
    // const contact = {
    //   userId: user._id,
    //   firstName: firstName,
    //   lastName: lastName,
    //   email: email,
    // };
    // await contactController.addContact(contact);

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

// @desc     search user
// @route    v1/user/search
// @access   private

const search = async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) {
      return res.status(200).json({
        elements: [],
        message: `0 users found.`,
        count: 0,
      });
    }

    const searchResult = await User.aggregate([
      {
        $search: {
          index: "name_tags",
          text: {
            query: `${key}`,
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);

    const elements = searchResult.length;

    return res.status(200).json({
      elements: searchResult,
      message: `${elements} users found.`,
      count: `${elements}`,
    });
  } catch (e) {
    return res.status(500).json({
      message: "server error",
      error: e,
    });
  }
};

// @desc     get all User
// @route    v1/user/profile
// @access   private
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.payload;
    const user = await User.findById(userId).exec();

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

// @desc     get user detail
// @route    v1/user/:id
// @access   private
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`::::::::::::req.params.id `, req.params.id);
    const user = await User.findById(userId).exec();

    const userFormatForClient = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      isActive: user.isActive,
      isReported: user.isReported,
      isBlocked: user.isBlocked,
    };

    return res.status(200).json({
      user: userFormatForClient,
      message: "get user by id OK! .",
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
      message: "get user by id failed! .",
    });
  }
};

module.exports = {
  getAllUser,
  getUserProfile,
  search,
  userSignIn,
  createUser,
  refreshToken,
  signOut,
  getUserById,
};
