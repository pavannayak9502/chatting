import React from "react";
import { Box, Avatar, Text } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
  return (
    <>
      <Box
        onClick={handleFunction}
        cursor="pointer"
        background="#E8E8E8"
        _hover={{
          background: "#38B2AC",
          color: "white",
        }}
        width="100%"
        display="flex"
        alignItems="center"
        color="black"
        px={3}
        py={2}
        marginBottom={2}
        borderRadius="lg"
        marginTop="15px"
      >
        <Avatar
          marginRight={2}
          size="sm"
          cursor="pointer"
          name={user.name}
          src={user.pic}
        />
        <Box>
          <Text>{user.name}</Text>
          <Text fontSize="xs">
            <b>Email : </b>
            {user.email}
          </Text>
        </Box>
      </Box>
    </>
  );
};

export default UserListItem;
