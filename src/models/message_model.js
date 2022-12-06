const { Schema, model } = require("mongoose");
const attachmentModel = require("./attachment.model");

const messageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "conversations",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    text: {
      type: String,
      default: "",
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: "attachments",
      },
    ],
    // attachments: new Schema({

    // }),
    deletedAt: {
      type: Date,
      default: new Date("1900-01-10T00:00:00Z"),
    },
  },
  { timestamps: true }
);

// messageSchema.options.toJSON = {
//   transform(_zipRequestDocument, ret, _options) {
//     // eslint-disable-line no-unused-vars
//     if (!ret.attachment) {
//       ret.attachments = [];
//     }
//   },
// };

module.exports = model("messages", messageSchema);
