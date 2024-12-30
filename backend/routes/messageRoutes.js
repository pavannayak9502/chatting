const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  sendMessage,
  allMessages,
} = require("../controllers/messageControllers");

const router = express.Router();

router.route("/").post(protect, sendMessage); //The sendMessage is an controller where we are creating the data for sending the chat for that user and storing into our database.

router.route("/:chatId").get(protect, allMessages); //The allMessages is an controller where we are fetching all the messages from our database of that particular user chat id.

module.exports = router;

//1. Sending the messages for that particular user.
//2. Fetching all the messages for that particular chat.
