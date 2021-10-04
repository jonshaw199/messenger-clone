import io from "socket.io-client";
import store from "./store";
import {
  removeOfflineUser,
  addOnlineUser,
  setMessageViewedOther,
} from "./store/conversations";
import { receiveMessage } from "./store/utils/thunkCreators";

const socket = io(window.location.origin);

socket.on("connect", () => {
  console.log("connected to server");

  socket.on("add-online-user", (id) => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on("remove-offline-user", (id) => {
    store.dispatch(removeOfflineUser(id));
  });

  socket.on("new-message", (data) => {
    store.dispatch(receiveMessage(data.message, data.sender, data.recipientId));
  });

  socket.on("message-viewed", (data) => {
    store.dispatch(setMessageViewedOther(data.conversationId, data.messageId));
  });
});

export default socket;
