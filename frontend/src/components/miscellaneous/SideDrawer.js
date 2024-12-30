import React, { useState } from "react";
import {
  Box,
  Button,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  MenuDivider,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import {
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvator/UserListItem";
import { getSender } from "../../Config/ChatLogics.js";
import NotificationBadge, { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const [search, setSearch] = useState(""); //For search user.
  const [searchResult, setSearchResults] = useState([]); //To display the search user as an array.
  const [loading, setLoading] = useState(false); //For loading state while searching the user.
  const [loadingChat, setLoadingChat] = useState(false); //Clicking on searchResults array we are creating a chat between them.

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  //Side drawer search user and chat with them.
  const handleSearch = async (event) => {
    event.preventDefault();

    //If no input by logger user and field was empty then throw the error.
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: "2500",
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    //The try and catch block is for sending an api post request to backend to search the user.
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      if (data.length === 0) {
        //If no user found by searched user from our backend of database then display ("no user found").
        toast({
          title: "No User Found",
          description: "Try a different search.",
          status: "info",
          duration: 3000,
          isClosable: true,
          position: "top-left",
        });
      }

      setLoading(false);
      setSearchResults(data); //sending the response data into setSearchResults array.

      // Clear the search input and results after selecting a user
      setSearch(""); //Reset the search input after closing the side bar.
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  //For accessing the chat bewteen logged user and searched user.
  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      } //The code you've provided is a JavaScript conditional statement that checks whether a specific chat (represented by data) already exists in an array called chats. If the chat does not exist, it adds the data chat to the beginning of the chats state array.

      setSelectedChat(data);
      setLoadingChat(false);

      setSearch(""); //After chat selected then clear the results.
      setSearchResults([]); //After chat selected then clear users array setSearchResults.
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
      return;
    }
  };

  //On clicking logout button we removing the user credentials and navigating the user to again login page.
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        background="white"
        width="100%"
        padding="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search user to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa-sharp-duotone fa-solid fa-magnifying-glass"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text
          fontSize="2xl"
          fontFamily="Work sans"
          style={{
            color: "lightpink",
            textShadow:
              "0px 0px 0px rgba(35, 207, 193, 0.8), 0px 0px 1px rgba(24, 169, 212, 0.6), 0px 0px 2px rgba(58, 223, 195, 0.4)",
            animation: "glow 1.5s ease-in-out infinite",
          }}
        >
          Pavan-Chat-App
        </Text>

        <div>
          <Menu>
            {/* Bell icon notifications */}
            <MenuButton p={1} marginRight={3}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" margin={1} />
            </MenuButton>
            <MenuList paddingLeft={2}>
              {/* For notification badge we need to install a package. npm install react-notification-badge --force */}
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/* For side search drawer*/}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
          <DrawerBody>
            <Box display="flex" padding={2}>
              <Input
                placeholder="Search name or email"
                marginRight={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner marginLeft="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
