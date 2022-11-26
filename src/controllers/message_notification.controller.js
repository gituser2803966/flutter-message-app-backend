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
    const unreadMessageNotification = await MessageNotiModel.findOneAndUpdate(
      {
        user: userId,
        conversation: conversationId,
      },
      { newMessageCount: 0 }
    );

    return unreadMessageNotification;
  } catch (err) {
    console.log(
      `::::: resetUnreadNewMessageCount ${resetUnreadNewMessageCount}`
    );
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
    console.log("::::::::updateOrCreateUnreadNewMessageForSender");
    console.log(
      `::::::::updateUnreadMessageNotificationModelForSender ${updateUnreadMessageNotificationModelForSender}`
    );

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
  const initUnreadMessageModelForRecipient = new MessageNotiModel({
    user: recipient,
    conversation: conversationId,
    newMessageCount: 1,
  });
  const initUnreadMessageDoc = await initUnreadMessageModelForRecipient.save();
  return initUnreadMessageDoc;
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
    console.log("::::::::RRRRRRR 1");
    updateUnreadMessageNotificationModelForRecipient.newMessageCount =
      updateUnreadMessageNotificationModelForRecipient.newMessageCount + 1;
    const updateUnreadMessageDocForRecipient =
      await updateUnreadMessageNotificationModelForRecipient.save();
    console.log(
      `::::::::updateUnreadMessageDocForRecipient ${updateUnreadMessageDocForRecipient}`
    );
    return updateUnreadMessageDocForRecipient;
  } else {
    console.log("::::::::RRRRRRR 2");
    const newUnreadMessageModelForRecipient = new MessageNotiModel({
      user: recipient,
      conversation: conversationId,
      newMessageCount: 1,
    });
    const newUnreadMessageDoc = await newUnreadMessageModelForRecipient.save();
    console.log(`::::::::newUnreadMessageDoc ${newUnreadMessageDoc}`);
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
