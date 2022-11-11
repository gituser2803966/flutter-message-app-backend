const { Schema, model } = require("mongoose");

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
    messageType: {
      type: String,
      enum: ["text", "file", "audio"],
      default: "text",
    },
    messageText: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: new Date("1900-01-10T00:00:00Z"),
    },
  },
  { timestamps: true }
);

module.exports = model("messages", messageSchema);
