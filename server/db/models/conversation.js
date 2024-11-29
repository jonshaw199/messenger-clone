const { Sequelize } = require("sequelize");
const db = require("../db");

const Conversation = db.define("conversation", {
  userIds: {
    type: Sequelize.ARRAY(Sequelize.INTEGER),
  },
});

// find conversation given all user IDs
Conversation.findConversation = async function (userIds) {
  const conversation = await Conversation.findOne({
    where: {
      userIds,
    },
  });
  // return conversation or null if it doesn't exist
  return conversation;
};

module.exports = Conversation;
