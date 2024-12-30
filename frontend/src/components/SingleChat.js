import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider.js";
import {
  Box,
  IconButton,
  Text,
  Spinner,
  FormControl,
  Input,
  useToast,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "../Config/ChatLogics.js";
import ProfileModal from "../components/miscellaneous/ProfileModal.js";
import UpdateGroupChatModal from "../components/miscellaneous/UpdateGroupChatModal.js";
import axios from "axios";
import "./Style.css";
import ScrollableChat from "./ScrollableChat.js";
import Lottie from "react-lottie";
import animationData from "../Animations/typing.json";

//For socket.io
import io from "socket.io-client";
const ENDPOINT = "http://localhost:5000";
var socket;
var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { user, selectedChat, setSelectedChat, notification, setNotification } =
    ChatState();
  const toast = useToast();

  //For socket.io connection.
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => {
      setSocketConnected(true);
    });

    socket.on("typing", () => {
      setIsTyping(true);
    });
    socket.on("stop typing", () => {
      setIsTyping(false);
    });
  }, []);

  //For typing indicator logic.
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    //Typing indicator logic.
    if (!socketConnected) {
      return; //If socket not connected then just return.
    }

    //If socket conneted. (!typing)=> true.
    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  //Fetching all the messages for an particular chat user.
  const fetchMessage = async () => {
    if (!selectedChat) {
      return; //If no chat selected by logged user then just return.
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id); //When user click on particular chat for chatting and the messages also loaded(fetches all the messages), we are throwing that user(sender) and recevier into a room for 1:1 chat. And passing the particular room id if for those selectedChat._id.
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the Messages!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }
  };
  //Fetching all chats for an particular chat and calling the fetchMessage component in useEffect to call the api and fetch the chats for particular chat.
  useEffect(() => {
    fetchMessage();

    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  //For sending a message to particular user.
  const sendMessage = async () => {
    if (newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage(""); //Clear input field after sending the message.

        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages([...messages, data]); //Add new message to the end of the last message.
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message!",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }
    }
  };

  //This useEffect is not for a normal useEffect, this useEffect is for update our state updates. so, we shouldn't use the array square brackets.
  useEffect(() => {
    //The logic for new message is taken from sendMessage component.
    socket.on("message recieved", (newMessageRecieved) => {
      //If user chatting with another person in different room then send a notification to that user.
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // give notification.
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]); //If user was in the same room then asusal send the message direct to him.
      }
    });
  });

  //For lottie default options.
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    renderSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <>
      {
        //If logged user selects chats means display the chat window else not selected means display(click on user to start chat).
        selectedChat ? (
          <>
            <Text
              fontSize={{ base: "25px", md: "30px" }}
              paddingBottom={3}
              px={2}
              width="100%"
              fontFamily="Work sans"
              display="flex"
              justifyContent={{ base: "space-between" }}
              alignItems="center"
            >
              <IconButton //Back arrow button only for mobile screen.
                display={{ base: "flex", md: "none" }}
                icon={<ArrowBackIcon />}
                onClick={() => setSelectedChat("")}
              />

              {/* If logged user selected user chat was a group chat then we are importing the updateGroupChat.js file for group chat view. If logged user selectedChat not a groupchat then display the chat view like 1:1 chat*/}
              {!selectedChat.isGroupChat ? ( //Its 1:1 chat .The getSender logic is for 1:1 chat to diplay the user(recevier) name and eye icon is for profile modal of that user(recevier).
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                //It's Group chat. The updateGroupChatModal is component(function file). So, when logged user click's on group chat then we are displaying the view of chat to group chat view(display features: adding the user, removing the user, rename the chat).
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                    fetchMessage={fetchMessage}
                  />
                </>
              )}
            </Text>

            {/* Chatting window */}
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="flex-end"
              padding={3}
              background="#E8E8E8"
              width="100%"
              height="100%"
              borderRadius="lg"
              overflow="hidden"
            >
              {/* Messages Here*/}
              {loading ? ( //Message Loading
                <Spinner
                  size="xl"
                  width={20}
                  height={20}
                  alignSelf="center"
                  margin="auto"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="green.500"
                  thickness="3px"
                />
              ) : (
                <div className="messages">
                  {/* Messages that I chatted with the person. So I am created another file(ScrollableChat.js) and I am passing the messages state arrary to display the chat's viceversa. */}
                  <ScrollableChat messages={messages} />
                </div>
              )}

              <FormControl id="userMessagesInput" isRequired marginTop={3}>
                {/* For displaying typing indicator we need to install the package. npm install react-lottie */}
                {isTyping ? (
                  <Box display="flex" alignItems="center" marginBottom={3}>
                    <Lottie
                      options={defaultOptions}
                      width={50}
                      style={{ marginLeft: 10 }}
                    />
                  </Box>
                ) : null}

                <Box display="flex" alignItems="center">
                  <Input
                    value={newMessage}
                    placeholder="Enter a message..."
                    background="#E0E0E0"
                    onChange={typingHandler}
                  />
                  <Button
                    onClick={sendMessage}
                    colorScheme="teal"
                    marginLeft={2}
                  >
                    Send
                  </Button>
                </Box>
              </FormControl>
            </Box>
          </>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            width="100%"
            background="linear-gradient(to right, #833ab4, #fd1d1d, #fcb045)"
          >
            <Text
              fontSize="5xl"
              paddingBottom={3}
              fontFamily="Work sans"
              color="whiteAlpha.800"
            >
              Click on a user to start chatting...
            </Text>
          </Box>
        )
      }
    </>
  );
};

export default SingleChat;
