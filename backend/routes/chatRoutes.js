const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} = require("../controllers/chatControllers");

const router = express.Router();

/* ----- For 1:1 Chat Routes --- */

router.route("/").post(protect, accessChat); //The (/) post route is for accessing the chat or creating the chat. Only the logged user have access for it. url=> http://localhost:5000/api/chat

router.route("/").get(protect, fetchChats); //The (/) get route is for fetching the chats. Only the logged user have access for it. url=> http://localhost:5000/api/chat

/* ----- Now for Group Chat Routes --- */

router.route("/group").post(protect, createGroupChat); //The (/group) post route is for creating the group chat. Only the logged user have access for it. url=> http://localhost:5000/api/chat/group

router.route("/rename").put(protect, renameGroup); //The (/rename) put route is for rename the group chat name. Only the logged user have access for it. url=> http://localhost:5000/api/chat/rename

router.route("/groupadd").put(protect, addToGroup); //The (/groupadd) put route is for adding the new member to the group chat. Only the logged user have access for it. url=> http://localhost:5000/api/chat/groupadd

router.route("/groupremove").put(protect, removeFromGroup); //The (/groupremove) put route is for removing the user from the group chat. Only the logged user have access for it. url=> http://localhost:5000/api/chat/groupremove

module.exports = router;
