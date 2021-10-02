import React from "react";
import { Box } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  lastReadContainer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: "10px",
    paddingBottom: "10px",
  },
  lastReadImage: {
    borderRadius: "50%",
    width: "25px",
    height: "25px",
  },
}));

const Messages = (props) => {
  const classes = useStyles();
  const { messages, otherUser, userId } = props;

  return (
    <Box>
      {messages.map((message, i) => {
        const time = moment(message.createdAt).format("h:mm");

        return message.senderId === userId ? (
          <Box key={i}>
            <SenderBubble text={message.text} time={time} />
            {message.id === otherUser.lastMessageViewed && (
              <Box className={classes.lastReadContainer}>
                <img
                  className={classes.lastReadImage}
                  src={otherUser.photoUrl}
                  alt="Last Read"
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box key={i}>
            <OtherUserBubble
              text={message.text}
              time={time}
              otherUser={otherUser}
            />
          </Box>
        );
      })}
    </Box>
  );
};

export default Messages;
