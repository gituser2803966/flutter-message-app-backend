const { Schema, model } = require("mongoose");

const conversationSchema = new Schema(
  {
    localId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    members: {
      type: [String],
      index: true,
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    lastActiveTime: {
      type: Date,
      default: Date.now(),
    },
    //default date
    deletedAt: {
      type: Date,
      default: new Date("1900-01-10T00:00:00Z"),
    },
  },
  { timestamps: true }
);

module.exports = model("conversations", conversationSchema);
