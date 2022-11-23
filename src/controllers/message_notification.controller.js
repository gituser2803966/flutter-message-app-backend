const MessageNotiModel = require("../models/message_notification.model");

const updateNewMessageCount = async (req, res) => {
  try {
    const { user, conversation } = req.body;
    const newMessageNotification = await MessageNotiModel.findOneAndUpdate(
      { user, conversation },
      { $set: { name: "jason bourne" } }
    );
    return res.status(200).json({
      newMessageNotification,
      message: "updateNewMessageCount OK!",
      newMessageCount: newMessageNotification.newMessageCount,
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
      message: "updateNewMessageCount error !!!.",
    });
  }
};

const getMessageNotification = async (req, res) => {
  try {
    const { userId } = req.payload;
    const messageNotifications = await MessageNotiModel.find({
      user: userId,
    });
    return res.status(200).json({
      messageNotifications,
      message: "getMessageNotification OK!",
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
      message: "getMessageNotification error !!!.",
    });
  }
};

module.exports = { updateNewMessageCount, getMessageNotification };
