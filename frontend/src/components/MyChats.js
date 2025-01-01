import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import axios from "axios";
import { Avatar, useToast } from "@chakra-ui/react";
import { Box, Button, Stack, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import ChatLoading from "./ChatLoading";
import { getSender, getSenderProfilePic } from "../Config/ChatLogics.js";
import GroupChatModal from "./miscellaneous/GroupChatModal.js";
import "../App.css";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState("");

  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const toast = useToast();

  //Fetching all the chats for logged user.
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data); //Passing all the chats to setChats state.
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.message,
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }
  };

  //Fetching all the chats for the logged user.
  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]); //Taking parent state variable(fetchAgain) to update the chats when user changes. Using useEffect we are fetching the chats when changes happens.

  return (
    <>
      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDirection="column"
        alignItems="center"
        padding={3}
        width={{ base: "100%", md: "31%" }}
        borderRadius="lg"
        borderWidth="1px"
        className="chatNameBackground"
      >
        <Box
          paddingBottom={3}
          px={3}
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily="initial"
          display="flex"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          color="lightslategray"
        >
          My Chats
          <GroupChatModal>
            <Button
              display="flex"
              fontSize={{ base: "17px", md: "10px", lg: "17px" }}
              rightIcon={<AddIcon />}
            >
              New Group Chat
            </Button>
          </GroupChatModal>
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          padding={3}
          width="100%"
          height="100%"
          borderRadius="lg"
          overflow="hidden"
        >
          {chats ? (
            <Stack overflowY="scroll">
              {chats.map((chat) => (
                <Box
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  background={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectedChat === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius="lg"
                  key={chat._id}
                  className="userHover"
                >
                  <Text>
                    {/* Displaying the image before the chat user name */}
                    <Avatar
                      src={getSenderProfilePic(loggedUser, chat.users)}
                      alt="User Picture"
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        marginRight: "10px",
                      }}
                    />
                    {!chat.isGroupChat
                      ? getSender(loggedUser, chat.users)
                      : chat.chatName}
                  </Text>
                </Box>
              ))}
            </Stack>
          ) : (
            <ChatLoading />
          )}
        </Box>
      </Box>
    </>
  );
};

export default MyChats;

//For left side chat users window and fetch their chats.
