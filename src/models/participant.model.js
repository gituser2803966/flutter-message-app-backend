const { Schema, model } = require("mongoose");

const participantSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "conversations",
    },
    // group members
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    //to tell if it's a group chat or a 1-on-1 chat
  },
  { timestamps: true }
);

module.exports = model("participants", participantSchema);
