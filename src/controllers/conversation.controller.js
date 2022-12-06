const ConversationModel = require("../models/conversation.model");
const messageController = require("../controllers/message.controller");
const messageNotificationController = require("../controllers/message_notification.controller");

const createConversation = async (conversation) => {
  try {
    const newConversation = new ConversationModel(conversation);
    const conversationDoc = await newConversation.save(conversation);
    return conversationDoc;
  } catch (err) {
    console.log(`::::::: createAndResponseConversation error: ${err}`);
  }
};

const isConversationExist = async (conversationId) => {
  try {
    const existConversation = await ConversationModel.findOne({
      localId: `${conversationId}`,
    });

    if (existConversation) return existConversation;

    return null;
  } catch (err) {
    console.log(`::::::: isConversationExist error: ${err}`);
  }
};

// @desc     get conversation list for userId
// @route   /v1/conversation/get-lists
// @access   private
const getConversationList = async (req, res) => {
  try {
    let conversationsClientFormat = [];

    const { userId } = req.payload;

    const conversations = await ConversationModel.aggregate([
      {
        $match: {
          members: `${userId}`,
        },
      },
      { $sort: { lastActiveTime: -1 } },
      { $limit: 15 },
    ]);

    for (const conversation of conversations) {
      const [messages, unreadMessageNotifications] = await Promise.all([
        messageController.getMessages({
          conversationId: conversation._id,
        }),
        messageNotificationController.getUnreadMessageCountNotification(
          userId,
          conversation._id
        ),
      ]);

      const conversationObject = {
        _id: conversation._id,
        localId: conversation.localId,
        title: conversation.title,
        channelId: conversation.channelId,
        lastActiveTime: conversation.lastActiveTime,
        creator: conversation.creator,
        members: conversation.members,
        messages: messages ?? [],
        unreadMessageNotification: unreadMessageNotifications ?? [],
        createdAt: conversation.createdAt,
        deletedAt: conversation.deletedAt,
        updatedAt: conversation.updatedAt,
      };

      conversationsClientFormat.push(conversationObject);
    }

    return res.status(200).json({
      conversations: conversationsClientFormat,
      message: "get all conversation success.",
      status: 200,
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
      message: "get conversation failed, server error!!!.",
    });
  }
};

const resetUnreadMessageCount = async (req, res) => {
  try {
    const { userId } = req.payload;
    const { conversationId } = req.body;
    const resetUnreadMessageNotification =
      await messageNotificationController.resetUnreadMessageCount(
        userId,
        conversationId
      );

    return res.status(200).json({
      data: resetUnreadMessageNotification,
      message: "reset Unread Message Count OK!",
      success: true,
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
      message: "reset unread message count failed!!!.",
    });
  }
};

const updateLastActiveTime = async (conversationId) => {
  try {
    const conversationDoc = await ConversationModel.findByIdAndUpdate(
      conversationId,
      {
        lastActiveTime: Date.now(),
      },
      { new: true }
    );
    console.log(
      `:::: update Last Active Time conversation Doc ${conversationDoc} `
    );
    return conversationDoc;
  } catch (err) {
    console.log(`::::: updateLastActiveTime is error : ${err}`);
  }
};

module.exports = {
  createConversation,
  getConversationList,
  isConversationExist,
  resetUnreadMessageCount,
  updateLastActiveTime,
};
