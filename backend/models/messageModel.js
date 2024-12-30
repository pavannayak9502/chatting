//1.The name of sender & Id of the sender, //2.The content of the message, //3.Referneces of the chat which it belongs to.
//Creating the schema for messageModel.

const mongoose = require("mongoose");

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //I am referencing the userModel for sender.
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" }, //I am referencing the complete chatModel for this chat(For what type of is this chat).
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageModel);

module.exports = Message;
