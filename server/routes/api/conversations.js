const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Sequelize, Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: [
        "id",
        "user1Id",
        "user2Id",
        "user1LastViewed",
        "user2LastViewed",
      ],
      order: [[Message, "createdAt", "ASC"]],
      include: [
        { model: Message },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    // The query above sorts the messages (ascending) and this sorts the conversations (descending)
    conversations.sort(
      (a, b) =>
        new Date(b.messages[b.messages.length - 1].createdAt) -
        new Date(a.messages[a.messages.length - 1].createdAt)
    );

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // Set the last view date on current user and "otherUser"
      let curUserConversationUserId, otherUserConversationUserId;
      if (convoJSON.otherUser.id === convoJSON.user1Id) {
        curUserConversationUserId = 2;
        otherUserConversationUserId = 1;
      } else {
        curUserConversationUserId = 1;
        otherUserConversationUserId = 2;
      }
      convoJSON.conversationUserId = curUserConversationUserId;
      convoJSON.lastViewed =
        convoJSON[`user${curUserConversationUserId}LastViewed`];
      convoJSON.otherUser.conversationUserId = otherUserConversationUserId;
      convoJSON.otherUser.lastViewed =
        convoJSON[`user${otherUserConversationUserId}LastViewed`];
      delete convoJSON.user1Id;
      delete convoJSON.user2Id;
      delete convoJSON.user1LastViewed;
      delete convoJSON.user2LastViewed;

      // Set the number of unread messages for each user
      convoJSON.unreadMessages = await Message.count({
        where: {
          [Op.and]: {
            [Op.or]: {
              senderId: !convoJSON.lastViewed ? convoJSON.otherUser.id : -1,
              createdAt: {
                [Op.gt]: convoJSON.lastViewed,
              },
            },
            senderId: convoJSON.otherUser.id,
            conversationId: convoJSON.id,
          },
        },
      });
      convoJSON.otherUser.unreadMessages = await Message.count({
        where: {
          [Op.and]: {
            createdAt: {
              [Op.gt]: convoJSON.otherUser.lastViewed,
            },
            senderId: userId,
          },
        },
      });

      // Sets the last message read by the other user
      const lastMsg = await Message.findOne({
        attributes: ["id"],
        where: {
          [Op.and]: {
            createdAt: {
              [Op.lte]: convoJSON.otherUser.lastViewed,
            },
            conversationId: convoJSON.id,
            senderId: userId,
          },
        },
        order: [["createdAt", "DESC"]],
      });
      convoJSON.otherUser.lastMessageViewed =
        lastMsg && lastMsg.id ? lastMsg.id : null;

      convoJSON.latestMessageText =
        convoJSON.messages[convoJSON.messages.length - 1].text;

      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.put("/:conversationId", async (req, res, next) => {
  try {
    const conversation = await Conversation.update(req.body, {
      where: { id: req.params.conversationId },
    });
    res.json({ conversation });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
