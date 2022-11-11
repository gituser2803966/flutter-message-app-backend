const ParticipantModel = require("../models/participant.model");
const ConversationModel = require("../models/conversation.model");

const findConversationForParticipant = async (recipients) => {
  const getAllParticipant = await ParticipantModel.find({});
  let isExistParticipant = getAllParticipant.filter((p) =>
    arrayEquality(p.users, recipients)
  );
  if (isExistParticipant.length > 0) {
    const conversation = await ConversationModel.findById({
      _id: isExistParticipant[0].conversation,
    });
    return conversation;
  } else {
    return null;
  }
};

const createAndResponseParticipant = async (participant) => {
  const newParticipant = new ParticipantModel(participant);
  const doc = await newParticipant.save();
  return doc;
};

function arrayEquality(a, b) {
  if (a.length !== b.length) return false;

  a.sort();
  b.sort();

  return a.every((element, index) => {
    return element.toString() === b[index].toString();
  });
}

module.exports = {
  findConversationForParticipant,
  createAndResponseParticipant,
};
