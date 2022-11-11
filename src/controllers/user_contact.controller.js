const UserContactModel = require("../models/user_contact.model");

const addUserContact = async (userContact) => {
  const newUserContact = new UserContactModel(userContact);
  await newUserContact.save();
};

//@route: /
//@private route
//get contact list
const getUserContactList = async (req, res) => {
  try {
    const { userId } = req.payload;
    const contactList = await UserContactModel.find({ user: userId })
      .populate("contact")
      .exec();
    return res.status(200).json({
      contacts: contactList,
      message: "get contact list success.",
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
      message: "get contact list failed, server error!!!.",
    });
  }
};

module.exports = { addUserContact, getUserContactList };
