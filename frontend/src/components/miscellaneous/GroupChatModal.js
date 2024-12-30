import React, { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  Input,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import { useToast, Spinner } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import axios from "axios";
import UserListItem from "../UserAvator/UserListItem.js";
import UserBadgeItem from "../UserAvator/UserBadgeItem.js";

const GroupChatModal = ({ children }) => {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, chats, setChats } = ChatState();
  const toast = useToast();

  //For search the users from our database using query api request.
  const handleSearch = async (query) => {
    setSearch(query); //Here I am passing query value in setSearch state.

    //If no no input means just return;
    if (!query) {
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
      console.log(data);
      setLoading(false);
      setSearchResults(data); //Iam passing the user search data in setSearchResults array.
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to load the search results!",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "bottom-left",
      });
      setLoading(false);
      return;
    }
  };

  //For adding the selcted users in setSelectedUsers array.
  const handleGroup = (userToAdd) => {
    //If selected user was already exist's in group then display the error(user already exists).
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 2500,
        isClosable: true,
        position: "top",
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]); //Using spread operator we are add the new user to our setSelectedUsers array.
  };

  //Removing the user from the group.
  const handleDelete = (delUser) => {
    setSelectedUsers(selectedUsers.filter((sel) => sel._id !== delUser._id)); //sel => sel._id !== delUser._id is the condition: for each user (sel) in the selectedUsers array, it checks if the user's _id is not equal to the _id of delUser. //sel._id !== delUser._id: This means that the filter will exclude the delUser from the resulting array because we are checking for users whose _id is not equal to delUser._id. //The .filter() method creates a new array that contains all users except the one matching delUser._id. This new array is passed to setSelectedUsers array to update the state.
  };

  //For creating the group chat.
  const handleSubmit = async () => {
    //If any fields are empty then throw the error(please fill all the fields.)
    if (!groupChatName || !selectedUsers) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
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

      const { data } = await axios.post(
        `/api/chat/group`,
        {
          name: groupChatName,
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );

      setChats([data, ...chats]); //When our group chat created we are display the user chat at top of it. By passing the new chats created and passing to setChats state to upadate the chats state.
      onClose();
      toast({
        title: "New Group Chat Created",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: "Failed to create the chat",
        description: error.response.data,
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      setSearchResults([]);
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={{ base: "2xl", md: "35px" }}
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            color="red.600"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center">
            <FormControl id="groupName">
              <Input
                placeholder="Chat Name"
                marginBottom={3}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl id="searchUser">
              <Input
                placeholder="Add Users eg: Lavori, Pavan, Nayak"
                marginBottom={3}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>

            {/* Displaying the selected users in group chat and the function(handleDelete) is for removing the user form selectedUsers array(from group chat)*/}
            <Box width="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((u) => (
                <UserBadgeItem
                  key={user._id}
                  user={u}
                  handleFunction={() => handleDelete(u)}
                />
              ))}
            </Box>

            {/* Render search users, when logged user(groupAdmin) click on user we are handling a function(handleGroup) to those users in setSelectedUsers array. */}
            {loading ? (
              <Spinner color="red" marginLeft="280px" marginTop="15px" />
            ) : (
              searchResults
                ?.slice(0, 4)
                .map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" marginRight={3} onClick={handleSubmit}>
              Create Chat
            </Button>

            <Button colorScheme="red" margin="5px" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
