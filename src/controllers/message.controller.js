const MessageModel = require("../models/message_model");
const AttachmentModel = require("../models/attachment.model");
const attachmentController = require("../controllers/attachment.controller");

const addMessage = async ({ conversation, sender, text, attachments = [] }) => {
  try {
    const messageData = new MessageModel({
      conversation,
      sender,
      text,
      attachments: attachments,
    });
    const messageDoc = await messageData.save();
    //find message with attachment
    return messageDoc;
  } catch (err) {
    console.log(`::::::::add new message error: ${err}`);
  }
};

const addMessageWithAttachment = async ({
  conversation,
  sender,
  text = "empty",
  attachment = {},
}) => {
  try {
    const url = attachment.url;
    //Save attachemnt
    const attachmentDoc = await attachmentController.addAttachment({ url });
    // Save message with attachment id
    const messageData = new MessageModel({
      conversation,
      sender,
      text,
      attachments: [attachmentDoc._id],
    });
    const messageDoc = await messageData.save();

    // required String id,
    // required String conversation,
    // required String sender,
    // required MessageText text,
    // required KtList<Attachment> attachments,
    // required String createdAt,
    // required String updatedAt,
    // required String deletedAt,

    return {
      _id: messageDoc._id,
      conversation: messageDoc.conversation,
      sender: messageDoc.sender,
      text: messageDoc.text,
      attachments: [attachmentDoc],
      createdAt: messageDoc.createdAt,
      updatedAt: messageDoc.updatedAt,
      deletedAt: messageDoc.deletedAt,
    };
  } catch (err) {
    console.log(`::::::::add new message with attachment error: ${err}`);
  }
};

const getMessages = async ({ conversationId }) => {
  try {
    const messages = await MessageModel.find({
      conversation: conversationId,
    }).populate("attachments");
    return messages;
  } catch (err) {
    console.log(`:::::::: Get Messages error ${err}`);
  }
};

module.exports = { addMessage, getMessages, addMessageWithAttachment };
