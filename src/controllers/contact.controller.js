const ContactModel = require("../models/contact.models");
const UserModel = require("../models/user.model");

const UserContactModel = require("../models/user_contact.model");

/**
 * @description Mobile API
 * @param {*} senderId
 * @param {*} recipientId
 * @returns [0-> contactForSender,1->contactForRecipient]
 */

const addContactForSender = async (senderId, recipientId) => {
  try {
    const recipient = await UserModel.findOne({ _id: recipientId });
    //for contact doc.
    const newRecipientContactDoc = new ContactModel({
      user: recipient._id,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      email: recipient.email,
    });
    const r_contact_doc = await newRecipientContactDoc.save();
    //for user contact doc.
    const recipientUserContactModel = new UserContactModel({
      user: senderId,
      contact: r_contact_doc._id,
    });
    const contactOfRecipient = await recipientUserContactModel.save();
    //
    const contactOfSenderForClientFormat = {
      _id: contactOfRecipient._id,
      user: contactOfRecipient.user,
      contact: r_contact_doc,
      createdAt: contactOfRecipient.createdAt,
      updatedAt: contactOfRecipient.updatedAt,
    };

    return contactOfSenderForClientFormat;

    ////add a contact for recipient
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const addContactForRecipient = async (senderId, recipientId) => {
  try {
    //add sender to contact of recipient
    const s_contact = await UserModel.findOne({ _id: senderId });
    //add recipient to contact of sender.
    const s_contact_info = {
      user: s_contact._id,
      firstName: s_contact.firstName,
      lastName: s_contact.lastName,
      email: s_contact.email,
    };
    //for contact doc.
    const newSenderContactInfoModel = new ContactModel(s_contact_info);
    const s_contact_doc = await newSenderContactInfoModel.save();

    const senderUserContactModel = new UserContactModel({
      user: recipientId,
      contact: s_contact_doc._id,
    });
    const contactOfSender = await senderUserContactModel.save();
    //
    const contactOfRecipientForClientFormat = {
      _id: contactOfSender._id,
      user: contactOfSender.user,
      contact: s_contact_doc,
      createdAt: contactOfSender.createdAt,
      updatedAt: contactOfSender.updatedAt,
    };

    return contactOfRecipientForClientFormat;
  } catch (err) {
    console.log(`error: ${err}`);
  }
};

module.exports = { addContactForSender, addContactForRecipient };
