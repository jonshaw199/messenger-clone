const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
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
      attributes: ["id"],
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

      // Sets number of messages unread by this user
      convoJSON.unreadMessages = await Message.count({
        where: {
          [Op.and]: {
            conversationId: convoJSON.id,
            senderId: convoJSON.otherUser.id,
            read: false,
          },
        },
      });

      // Sets the last message read by the other user
      const lastMsgViewed = await Message.findOne({
        attributes: ["id"],
        where: {
          [Op.and]: {
            conversationId: convoJSON.id,
            senderId: userId,
            read: true,
          },
        },
        order: [["id", "DESC"]],
      });
      convoJSON.otherUser.lastMessageViewed =
        lastMsgViewed && lastMsgViewed.id ? lastMsgViewed.id : null;

      convoJSON.latestMessageText =
        convoJSON.messages[convoJSON.messages.length - 1].text;

      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.put("/read/:messageId", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const msg = await Message.findByPk(req.params.messageId);
    if (!msg) {
      return res.sendStatus(404);
    }
    const convo = await Conversation.findByPk(msg.conversationId);
    if (!convo) {
      return res.sendStatus(404);
    }
    // Make sure this user is part of the conversation
    if (![convo.user1Id, convo.user2Id].includes(userId)) {
      return res.sendStatus(403);
    }
    // Make sure this user is not the sender
    if (msg.senderId === userId) {
      return res.sendStatus(403);
    }
    // Everything checks out so update the read status on this message and the previous ones
    const result = await Message.update(
      { read: true },
      {
        where: {
          [Op.and]: {
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            id: {
              [Op.lte]: msg.id,
            },
            read: false,
          },
        },
      }
    );
    return res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
