const ConversationModel = require("../models/conversation.model");
const ParticipantModel = require("../models/participant.model");
const messageController = require("../controllers/message.controller");

const createAndResponseConversation = async (conversation) => {
  const newConversation = new ConversationModel(conversation);
  const conversationDoc = await newConversation.save(conversation);
  return conversationDoc;
};

const isConversationAlready = async () => {
  return true;
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
      const [conversation, messages] = await Promise.all([
        ConversationModel.find({
          _id: participant.conversation,
        }),
        messageController.getMessagesForConversation(participant.conversation),
      ]);

      const conversationObject = {
        _id: conversation[0]._id,
        participants: participant.users,
        title:
          conversation[0].title !== "" ? conversation[0].title : "No title",
        channelId: conversation[0].channelId,
        creator: conversation[0].creator,
        messages: messages,
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

// @desc     get conversation list for userId
// @route   /v1/conversation/get-lists
// @access   private
const getTitleForPrivateConversation = async (req, res) => {
  try {
    const { participants } = req.params;
  } catch (err) {}
};

module.exports = {
  createAndResponseConversation,
  getConversationList,
  isConversationAlready,
};
