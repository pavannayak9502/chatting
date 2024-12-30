import React, { useState } from "react";
import { IconButton, useDisclosure } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  FormControl,
  Input,
  ModalFooter,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import { ViewIcon } from "@chakra-ui/icons";
import UserBadgeItem from "../UserAvator/UserBadgeItem.js";
import UserListItem from "../UserAvator/UserListItem.js";
import axios from "axios";

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessage }) => {
  const [groupChatName, setGroupChatName] = useState();
  const [search, setSearch] = useState();
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();
  const toast = useToast();

  //Renaming the chat Name.
  const handleRename = async () => {
    if (groupChatName === "") {
      // Check if the groupChatName was empty then throw the error.
      toast({
        title: "No Input",
        description: "Please provide a name for the group chat.",
        status: "warning",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      return; // Exit the function if no valid input is provided
    }

    try {
      setRenameLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      toast({
        title: "Chat Name Updated!",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });
      setRenameLoading(false);
      return;
    }
    setGroupChatName(""); // Reset group chat name input field
  };

  //Adding the user to the group chat.
  const handleSearch = async (query) => {
    setSearch(query); //passing the name in the setSearch variable state.
    if (!query) {
      //If no query means just simply return.
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search results!",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  //Adding a new user to the group chat.
  const handleAddUser = async (user1) => {
    //If selected user already in group then display error.
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: "User Already in group!",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      return;
    }

    //The group admin have access to add the user in the group.
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only admins can add someone!",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer: ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }
  };

  //Removing the users from the group chat only.
  const handleRemove = async (user1) => {
    //Only group admin have access to remove someone from the group.
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: "Only admins can remove someone!",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      user1._id === user._id ? setSelectedChat() : setSelectedChat(data); ////The main logic for both handleRemove() : So if current user who want's to leave the group or left the group then we need to make setSelectedChat() to empty obviously we don't want the user to see the chat's from that exited group. If group admin removed the user from group we are going logic through setSelectedChat(data) and then user will be deleted from group and chat window also refreshed.
      toast({
        title: "User Removed!",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });

      setFetchAgain(!fetchAgain);
      fetchMessage(); //Calling the fetchMessage component from singleChat.js file is to fetch all the messages again when admin removes someone from group or the user leaved themself from the group.
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            color="skyblue"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box width="100%" display="flex" flexWrap="wrap" paddingBottom={3}>
              {
                //Here I am rendering all the users who belongs to that exact group.
                selectedChat.users.map((u) => (
                  <UserBadgeItem
                    key={user._id}
                    user={u}
                    handleFunction={() => handleRemove(u)}
                  />
                ))
              }
            </Box>
            <FormControl display="flex">
              <Input
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                placeholder="Chat Name"
                marginBottom={3}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                marginLeft={1}
                isLoading={renameLoading}
                onClick={handleRename}
                fontSize="sm"
              >
                Update Name
              </Button>
            </FormControl>

            <FormControl>
              <Input
                placeholder="Add User to group"
                marginBottom={1}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner
                size="lg"
                marginTop="10px"
                marginLeft={"40%"}
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
              />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>
          <ModalFooter>
            {/* If any user want to leave from group they can leave the group */}
            <Button
              colorScheme="red"
              marginRight={3}
              onClick={() => handleRemove(user)}
            >
              Leave Group
            </Button>
            <Button colorScheme="blue" marginRight={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
