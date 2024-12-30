import React from "react";
import { Skeleton, Stack } from "@chakra-ui/react";

//For chat loading when user search in side drawer.
const ChatLoading = () => {
  return (
    <>
      <Stack>
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
        <Skeleton height="45px" />
      </Stack>
    </>
  );
};

export default ChatLoading;
