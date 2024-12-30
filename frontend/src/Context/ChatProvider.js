import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext(); //This function creates a context object. The context object will contain two main components: a Provider and a Consumer.

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setSelectedChat] = useState();
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo")); //Getting the user info from localstorage and storing the user data from localStorage to userInfo variable.

    setUser(userInfo);

    if (!userInfo) {
      //If user not logged in then navigate to login page.
      navigate("/");
    }
  }, [navigate]);

  return (
    //This ChatContext.Provider is used to provide the value that you want to make available to all child components.
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  //Context.Consumer (or useContext hook): This is used to consume the value provided by the Provider. It allows components to access the context data.
  return useContext(ChatContext);
};

export default ChatProvider;
