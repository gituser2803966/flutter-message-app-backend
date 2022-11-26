const { Schema, model } = require("mongoose");

const messageNotificationSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "conversations",
    },
    newMessageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = model("notifications", messageNotificationSchema);
