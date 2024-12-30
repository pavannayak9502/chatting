import React, { useEffect } from "react";
import { Container } from "@chakra-ui/react";
import {
  Box,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import LoginPage from "../components/Authentication/LoginPage.js";
import RegisterPage from "../components/Authentication/RegisterPage.js";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo")); //We are getting info from userInfo and storing in user variable.

    if (user) {
      //If true means if user already logged in then navigate to chat page.
      navigate("/chat");
    }
  }, [navigate]);

  return (
    <>
      <Container maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          padding={3}
          backgroundColor={"white"}
          margin="40px 0px 15px 0px"
          borderRadius="lg"
          borderWidth="3px"
          borderColor="blackAlpha.400"
        >
          <Text color="red" fontSize="3xl" fontFamily="Work sans">
            Pavan-Chat-App
          </Text>
        </Box>

        <Box
          backgroundColor="white"
          width="100%"
          padding={4}
          borderWidth="1px"
          borderRadius="lg"
        >
          <Tabs variant="soft-rounded" colorScheme="green">
            <TabList marginBottom="1em">
              <Tab width="50%">Login</Tab>
              <Tab width="50%">Register</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <LoginPage /> {/* Login Page component */}
              </TabPanel>
              <TabPanel>
                <RegisterPage /> {/* Register Page component */}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </>
  );
};

export default HomePage;
