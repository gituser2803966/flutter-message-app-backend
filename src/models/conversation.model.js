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
    channelId: {
      type: String,
      required: true,
    },
    newMessageCount: {
      type: Number,
      default: 0,
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
