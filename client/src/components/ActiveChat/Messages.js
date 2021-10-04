import React from "react";
import { Box, Avatar } from "@material-ui/core";
import { SenderBubble, OtherUserBubble } from "../ActiveChat";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  lastReadContainer: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  lastReadAvatar: {
    height: "25px",
    width: "25px",
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
                <Avatar
                  src={otherUser.photoUrl}
                  alt="Last Read"
                  className={classes.lastReadAvatar}
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
