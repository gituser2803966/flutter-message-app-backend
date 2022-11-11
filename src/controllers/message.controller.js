const MessageModel = require("../models/message_model");

const addAndResponeMessage = async (message) => {
  const newMessage = new MessageModel(message);
  const messageRes = await newMessage.save(message);
  return messageRes;
};

const getMessagesForConversation = async (conversation) => {
  try {
    const messages = await MessageModel.find({ conversation });
    return messages;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { addAndResponeMessage, getMessagesForConversation };
