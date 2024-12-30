const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel.js");
const User = require("../models/userModel.js");

// ---- 1:1 chat ----

//Creating the 1:1 chat between logged user and searched user.
const accessChat = asyncHandler(async (req, res) => {
  //For 1:1 chat

  const { userId } = req.body;

  if (!userId) {
    //If user Id does't exit then give logged user response of 400.
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  //If current logged user was already friend to that searched exists user means display's there 1:1 chat. For 1:1 chat the groupChat must be false.
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  //After finding the 1:1 chat then again we are finding that sender user from userModal after finding that user we are populating the latest message from that user.
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    //If 1:1 chat exists for logged user and receiver user(friend) then display the latest message of chat array[0](which means latest message from that chat) as response to the receiver(friend).
    res.send(isChat[0]);
  } else {
    //If chat not found means then create the new chat between them logged user and searched user. For 1:1 chat the group chat property and its value must be false. The user._id(logged user) and userId(searched user).
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData); //Creating the new chat between the logged user and searched user.

      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      ); //After creating the chat between them again we are finding those new createdChat in Chats database after finding them from database we are populating the users array and most important we are not displaying the password.

      res.status(200).send(FullChat); //Sending the response of newly created chat between logged user and searched user.
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

//Fetching the 1:1 chat which user logged in and query all the chats from the database for that particular logged user and their chats as response.
const fetchChats = asyncHandler(async (req, res) => {
  //Find the chat from database using there current logged in id from the users array. After finding the chat we are populating the (users array, groupAdmin( for 1:1 who searched the user and created a chat between them), latestMessage) as response.
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) //Message from new(descending) to old(ascending order) message.
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });

        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// ----- For Group Chat -----

//Creating the group chat.
const createGroupChat = asyncHandler(async (req, res) => {
  //Check if user creating the group without users or without group name field means then throw the error.
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  var users = JSON.parse(req.body.users); //From frontend we are passing the users array as stringify format but here in backend we want that stringify users array as JSON.parse format.

  //To create a group chat we need more than 2 members to create a group chat.
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user); //Here after creating the chat we are pushing the current logged user into that users array who created the group chat.

  try {
    //Creating the new group chat from the Chatmodal with new  group chat id.
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fulGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fulGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//Renaming the group chat.
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body; //Taking group chat id and old chat name from body req.

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  ) //Updating the new name which was provided by user from frontend.
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  //If no updated name means then throw the error else update the new group chat name which was provided by frontend user.
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
});

//Adding a new member to group chat.
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body; //Taking group chat id and new user id to add in the group.

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } }, //In users array we are pushing the new user id.
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  //If no one in group means throw the error else update the new user in the group chat.
  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});

//Removing a user from group chat.
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body; //Taking group chat id and user id to remove from the group.

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } }, //In users array we are pull(removing) the userId from that group.
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
