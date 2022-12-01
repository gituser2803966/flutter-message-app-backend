const MessageNotiModel = require("../models/message_notification.model");

const addNewMessageNotification = async (messageNotication) => {
  try {
    const newMessageNotiModel = new MessageNotiModel(messageNotication);
    const newMessageNotiDoc = await newMessageNotiModel.save();
    return newMessageNotiDoc;
  } catch (err) {
    console.log(`:::::: addNewMessageNotification error ${err}`);
  }
};

const resetUnreadMessageCount = async (userId, conversationId) => {
  try {
    const unreadMessageNotiDoc = await MessageNotiModel.findOne({
      user: userId,
      conversation: conversationId,
    });

    unreadMessageNotiDoc.newMessageCount = 0;

    const newUnreadMessageNotiDoc = await unreadMessageNotiDoc.save();
    return newUnreadMessageNotiDoc;
  } catch (err) {
    console.log(`::::: resetUnreadNewMessageCount error ${err}`);
  }
};

const updateOrCreateUnreadNewMessageForSender = async (
  senderId,
  conversationId
) => {
  const updateUnreadMessageNotificationModelForSender =
    await MessageNotiModel.findOne({
      user: senderId,
      conversation: conversationId,
    });

  if (updateUnreadMessageNotificationModelForSender) {
    return updateUnreadMessageNotificationModelForSender;
  } else {
    console.log("::::::::SSSSSSSS 2");
    const newUnreadMessageModelForSender = new MessageNotiModel({
      user: senderId,
      conversation: conversationId,
    });
    const newUnreadMessageNotificationDocForSender =
      await newUnreadMessageModelForSender.save();
    return newUnreadMessageNotificationDocForSender;
  }
};

const initUnreadNewMessageForRecipient = async (recipient, conversationId) => {
  try {
    const initUnreadMessageModelForRecipient = new MessageNotiModel({
      user: recipient,
      conversation: conversationId,
      newMessageCount: 1,
    });
    const initUnreadMessageDoc =
      await initUnreadMessageModelForRecipient.save();
    return initUnreadMessageDoc;
  } catch (err) {
    console.log(`:::::: initUnreadNewMessageForRecipient error ${err}`);
  }
};

const updateOrCreateUnreadNewMessageForRecipient = async (
  recipient,
  conversationId
) => {
  const updateUnreadMessageNotificationModelForRecipient =
    await MessageNotiModel.findOne({
      user: recipient,
      conversation: conversationId,
    });

  if (updateUnreadMessageNotificationModelForRecipient) {
    updateUnreadMessageNotificationModelForRecipient.newMessageCount =
      updateUnreadMessageNotificationModelForRecipient.newMessageCount + 1;
    const updateUnreadMessageDocForRecipient =
      await updateUnreadMessageNotificationModelForRecipient.save();
    return updateUnreadMessageDocForRecipient;
  } else {
    const newUnreadMessageModelForRecipient = new MessageNotiModel({
      user: recipient,
      conversation: conversationId,
      newMessageCount: 1,
    });
    const newUnreadMessageDoc = await newUnreadMessageModelForRecipient.save();
    return newUnreadMessageDoc;
  }
};

const getUnreadMessageCountNotification = async (userId, conversationId) => {
  try {
    const messageNotifications = await MessageNotiModel.find({
      conversation: conversationId,
      user: userId,
    });
    return messageNotifications;
  } catch (err) {
    console.log(`::::getUnreadMessageCountNotification error ${error}`);
  }
};

module.exports = {
  getUnreadMessageCountNotification,
  addNewMessageNotification,
  updateOrCreateUnreadNewMessageForRecipient,
  updateOrCreateUnreadNewMessageForSender,
  initUnreadNewMessageForRecipient,
  resetUnreadMessageCount,
};
