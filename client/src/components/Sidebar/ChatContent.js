import React from "react";
import { Box, Typography, Chip } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    flexGrow: 1,
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: (props) => ({
    fontWeight: 900,
    fontSize: 12,
    color:
      props.conversation && props.conversation.unreadMessages > 0
        ? "black"
        : "#9CADC8",
    letterSpacing: -0.17,
  }),
  counterContainer: {
    display: "flex",
    alignItems: "center",
    marginRight: 20,
  },
  counter: {
    fontWeight: 900,
  },
}));

const ChatContent = (props) => {
  const classes = useStyles(props);

  const { conversation } = props;
  const { latestMessageText, otherUser, unreadMessages } = conversation;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>
          {otherUser.username}
        </Typography>
        <Typography className={classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
      {unreadMessages > 0 && (
        <Box className={classes.counterContainer}>
          <Chip
            className={classes.counter}
            label={unreadMessages}
            size="small"
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ChatContent;
