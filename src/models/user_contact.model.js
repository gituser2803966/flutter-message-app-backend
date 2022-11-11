const { Schema, model } = require("mongoose");

const userContactSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    contact: {
      type: Schema.Types.ObjectId,
      ref: "contacts",
    },
  },
  { timestamps: true }
);

module.exports = model("user_contact", userContactSchema);
