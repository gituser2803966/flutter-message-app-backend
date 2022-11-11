const ContactModel = require("../models/contact.models");
const UserModel = require("../models/user.model");

const UserContactModel = require("../models/user_contact.model");

/**
 * @description Mobile API
 * @param {*} senderId
 * @param {*} recipientId
 * @returns [0-> contactForSender,1->contactForRecipient]
 */

const addContactForSenderAndRecipient = async (senderId, recipientId) => {
  try {
    const recipient = await UserModel.findOne({ _id: recipientId });
    //add recipient to contact of sender.
    const r_contact_info = {
      user: recipient._id,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      email: recipient.email,
    };
    //for contact doc.
    const newRecipientContactDoc = new ContactModel(r_contact_info);
    const r_contact_doc = await newRecipientContactDoc.save();

    const recipientContact = {
      user: senderId,
      contact: r_contact_doc._id,
    };
    //for user contact doc.
    const recipientUserContactModel = new UserContactModel(recipientContact);
    const contactOfRecipient = await recipientUserContactModel.save();
    /* **************************
     ************************************
     ********************************************/
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

    //for user contact doc.
    const senderUserContactIfo = {
      user: recipientId,
      contact: newSenderContactInfoModel._id,
    };
    const senderUserContactModel = new UserContactModel(senderUserContactIfo);
    const contactOfSender = await senderUserContactModel.save();

    //
    const userContactForSender = {
      _id: contactOfSender._id,
      user: recipientId,
      contact: s_contact_doc,
      createdAt: contactOfSender.createdAt,
      updatedAt: contactOfSender.updatedAt,
    };

    //
    const userContactForRecipient = {
      _id: contactOfRecipient._id,
      user: senderId,
      contact: r_contact_doc,
      createdAt: contactOfRecipient.createdAt,
      updatedAt: contactOfRecipient.updatedAt,
    };

    return [userContactForSender, userContactForRecipient];

    ////add a contact for recipient
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = { addContactForSenderAndRecipient };
