import React, { useState } from "react";
import { ChatState } from "../Context/ChatProvider.js";
import SideDrawer from "../components/miscellaneous/SideDrawer.js";
import { Box } from "@chakra-ui/react";
import MyChats from "../components/MyChats.js";
import ChatBox from "../components/ChatBox.js";

const ChatPage = () => {
  const { user } = ChatState(); //Taking user state from ChatState.
  const [fetchAgain, setFetchAgain] = useState(false); //It will fetch if user add some in chat or changes in chat group(add's to group or leaves from group) means it will refetch the all chatpage to update to state.

  return (
    <>
      <div style={{ width: "100%" }}>
        {/* If user logged in then display the SideDrawer componnet and also Mychats component and ChatBox component */}
        {user && <SideDrawer />}
        <Box
          display="flex"
          justifyContent="space-between"
          width="100%"
          height="91.5vh"
          padding="10px"
        >
          {user && <MyChats fetchAgain={fetchAgain} />}
          {/*  At here I am supplying the fetAgain state to update the chats when change happens. */}

          {user && (
            <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
          {/* At here I am supplying the fetAgain and setFetchAgain state to update thier states when logged user makes changes in it.  */}
        </Box>
      </div>
    </>
  );
};

export default ChatPage;
