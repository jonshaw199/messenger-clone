import io from "socket.io-client";
import store from "./store";
import {
  removeOfflineUser,
  addOnlineUser,
  setOtherUserViewed,
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
    store.dispatch(receiveMessage(data.message, data.sender));
  });

  socket.on("conversation-viewed", (data) => {
    store.dispatch(setOtherUserViewed(data.conversationId, data.viewDate));
  });
});

export default socket;
