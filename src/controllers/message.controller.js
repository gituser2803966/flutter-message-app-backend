const MessageModel = require("../models/message_model");

const addAndResponeMessage = async (message) => {
  try {
    const newMessage = new MessageModel(message);
    const messageRes = await newMessage.save(message);
    return messageRes;
  } catch (err) {
    console.log(`::::::::add new message error: ${err}`);
  }
};

const getMessagesForConversation = async (conversation) => {
  try {
    const messages = await MessageModel.find({ conversation });
    return messages;
  } catch (err) {
    console.log(`:::::::: getMessagesForConversation error ${err}`);
  }
};

module.exports = { addAndResponeMessage, getMessagesForConversation };
