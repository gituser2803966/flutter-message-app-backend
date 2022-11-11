//time to expired access token token: 7 day
const TTL_ACCESS_TOKEN = 24 * 7 * 60;
//time to expired refresh token token: 1 year
const TTL_REFRESH_TOKEN = "1y";

const MESSAGE_TYPE = {
  text: "text",
  file: "file",
};

const PARTICIPANT_TYPE = {
  oneToOne: "oneToOne",
  group: "group",
};

module.exports = {
  TTL_ACCESS_TOKEN,
  TTL_REFRESH_TOKEN,
  MESSAGE_TYPE,
  PARTICIPANT_TYPE,
};
