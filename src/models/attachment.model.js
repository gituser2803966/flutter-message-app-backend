const { Schema, model } = require("mongoose");

const attachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      default: "",
    },
    thumbUrl: {
      type: String,
      default: "",
    },
    attachmentType: {
      type: String,
      enum: ["image", "file", "audio"],
      default: "image",
    },
    deletedAt: {
      type: Date,
      default: new Date("1900-01-10T00:00:00Z"),
    },
  },
  { timestamps: true }
);

module.exports = model("attachments", attachmentSchema);
