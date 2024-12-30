import React from "react";
import { ChatState } from "../Context/ChatProvider.js";
import { Box } from "@chakra-ui/react";
import SingleChat from "./SingleChat.js";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <>
      <Box
        display={{ base: selectedChat ? "flex" : "none", md: "flex" }} //For mobile the chatBox screen will be none when mobile user select the user chat on left side chat window then chat box will be displayed as flex. For bigger screen display both left side users box and right side chat box.
        alignItems="center"
        flexDirection="column"
        padding={3}
        background="white"
        width={{ base: "100%", md: "68%" }}
        borderRadius="lg"
        borderWidth="1px"
      >
        <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
      </Box>
    </>
  );
};

export default ChatBox;

//ChatBox means for chatting window and singleChat is for chatting between the users.
