const ConversationModel = require("../models/conversation.model");
const ParticipantModel = require("../models/participant.model");
const messageController = require("../controllers/message.controller");
const messageNotificationController = require("../controllers/message_notification.controller");

const createAndResponseConversation = async (conversation) => {
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

    const participants = await ParticipantModel.find({
      users: `${userId}`,
    });

    for (const participant of participants) {
      const [conversation, messages, unreadMessagenotifications] =
        await Promise.all([
          ConversationModel.find({
            _id: participant.conversation,
          }),
          messageController.getMessagesForConversation(
            participant.conversation
          ),
          messageNotificationController.getUnreadMessageCountNotification(
            userId,
            participant.conversation
          ),
        ]);

      const conversationObject = {
        _id: conversation[0]._id,
        localId: conversation[0].localId,
        participants: participant.users,
        title:
          conversation[0].title !== "" ? conversation[0].title : "No title",
        channelId: conversation[0].channelId,
        creator: conversation[0].creator,
        messages: messages,
        unreadMessageNotification: unreadMessagenotifications ?? [],
        createdAt: conversation[0].createdAt,
        deletedAt: conversation[0].deletedAt,
        updatedAt: conversation[0].updatedAt,
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

    console.log(`::::: conversationId ${conversationId}`);
    console.log(`::::: userId ${userId}`);

    const resetUnreadMessageNotification =
      await messageNotificationController.resetUnreadMessageCount(
        userId,
        conversationId
      );

    console.log(
      `::::::::resetUnreadMessageNotification ${resetUnreadMessageNotification}`
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

module.exports = {
  createAndResponseConversation,
  getConversationList,
  isConversationExist,
  resetUnreadMessageCount,
};
