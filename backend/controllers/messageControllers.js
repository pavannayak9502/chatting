const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel.js");
const User = require("../models/userModel.js");
const Chat = require("../models/chatModel");

// Three requirements needed: 1.Chat id on which chat we need to send the message., 2.The Actuall message itself., 3.Who is the sender of the message => and we will take the sender from protect middleware(authMiddleware.js file) which means current logged in sender id.
//Imp : We need to pass the chatId of 1:1 chat main id & group chat main id for sending the messages. Not an userid of that chat.
const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  //Creating an object which contains all fields of the message body.
  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  //For saving the message body into our database.
  try {
    var message = await Message.create(newMessage); //Creating and storing the newMessage var variable into our Message model and then storing into our database.

    message = await message.populate("sender", "name pic");

    message = await message.populate("chat");

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    //For latest message of that particular chat. Using chatModel we are finding the latest message by passing our message variable.
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//Fetching all the messages for that chatId.
const allMessages = asyncHandler(async (req, res) => {
  //(req.params(id).chatId) We are finding the particular chat from database using the chatId and then populating the message sender and his name, pic,email and overall populating the chat.
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");

    res.send(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { sendMessage, allMessages };
