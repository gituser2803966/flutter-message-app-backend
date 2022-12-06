const AttachmentModel = require("../models/attachment.model");

const addAttachment = async ({ url, attachmentType = "image" }) => {
  const attachmentModel = new AttachmentModel({
    url,
    attachmentType,
  });
  const attachmentDoc = await attachmentModel.save();
  return attachmentDoc;
};

module.exports = { addAttachment };
