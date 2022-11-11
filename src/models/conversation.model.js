const { Schema, model } = require("mongoose");

const conversationSchema = new Schema(
  {
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
    //default date
    deletedAt: {
      type: Date,
      default: new Date("1900-01-10T00:00:00Z"),
    },
  },
  { timestamps: true }
);

module.exports = model("conversations", conversationSchema);
