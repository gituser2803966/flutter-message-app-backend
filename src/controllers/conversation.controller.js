const ConversationModel = require("../models/conversation.model");
const ParticipantModel = require("../models/participant.model");
const messageController = require("../controllers/message.controller");

//add newMessageCount field
const addNewMessageCountField = async (req, res) => {
  try {
    await ConversationModel.updateMany({}, { $set: { newMessageCount: 0 } });
    return res.status(200).json({
      result: true,
      message: "add New Message Count Field OK!",
    });
  } catch (err) {
    console.log(`::::::: addNewMessageCountField error: ${err}`);
  }
};

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
      const [conversation, messages] = await Promise.all([
        ConversationModel.find({
          _id: participant.conversation,
        }),
        messageController.getMessagesForConversation(participant.conversation),
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

module.exports = {
  createAndResponseConversation,
  getConversationList,
  isConversationExist,
  addNewMessageCountField,
};
