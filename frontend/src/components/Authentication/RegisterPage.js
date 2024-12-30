import React, { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [pic, setPic] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  //To display the password for user.
  const handleShowPassword = () => {
    setShowPass(!showPass); //Invert the value of showPass => false to true.
  };

  //To upload the picture to cloudinary.
  const postDetails = (pics) => {
    setLoading(true);

    //Checking if user not provided for the picture.
    if (pics === undefined) {
      toast({
        title: "Please select an Image",
        status: "warning",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    //Checking what type of the image provided by the user.
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "pavancloud");

      fetch("https://api.cloudinary.com/v1_1/pavancloud/image/upload", {
        method: "post",
        body: data,
      }) //After uploading user display to user that pic has been uploaded to cloudinary database. After that we are those data of url into string format into our setPic variable.
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((error) => {
          toast({
            title: "Error while uploading to database!",
            description: error.message,
            status: "error",
            duration: 1500,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
          return;
        });

      toast({
        //After storing the url stirng of an image in setPic variable it will directly store into our database.
        title: "Picture uploaded to database",
        status: "success",
        duration: 1500,
        isClosable: true,
        position: "bottom",
      });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  //Submit the user details to backend server to store into the database.
  const submitHandler = async () => {
    setLoading(true);
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please fill all the fields!",
        status: "warning",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password isn't match",
        status: "warning",
        duration: 2500,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user",
        { name, email, password, pic },
        config
      );

      toast({
        title: "Registration Successful",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);

      //If registration completed then push to chat's page.
      navigate("/chat");
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 3500,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <VStack spacing={5}>
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Pavan Nayak"
            onChange={(e) => setName(e.target.value)}
            title="User Name"
          />
        </FormControl>

        <FormControl id="user-email" isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            placeholder="user06@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
            title="User Email"
          />
        </FormControl>

        <FormControl id="user-password" isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <Input
              type={showPass ? "text" : "password"}
              placeholder="User Password"
              title="User Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button height="1.75rem" size="sm" onClick={handleShowPassword}>
                {showPass ? (
                  <i className="fa-regular fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="user-confirmPassword" isRequired>
          <FormLabel>Confirm Password</FormLabel>
          <InputGroup>
            <Input
              type={showPass ? "text" : "password"}
              placeholder="confirm Password"
              title="User Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button height="1.75rem" size="sm" onClick={handleShowPassword}>
                {showPass ? (
                  <i className="fa-regular fa-eye-slash"></i>
                ) : (
                  <i className="fa-solid fa-eye"></i>
                )}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <FormControl id="user-pic" isRequired>
          <FormLabel>Upload your Picture</FormLabel>
          <Input
            type="file"
            padding={1.5}
            title="User Picture"
            accept="image/*"
            onChange={(e) => postDetails(e.target.files[0])} //The files property is an array-like object containing the files chosen in the input field. In this case, it assumes only one file is selected (hence the [0]).
          />
        </FormControl>

        <Button
          colorScheme="blue"
          width="100%"
          style={{ marginTop: 15 }}
          onClick={submitHandler}
          isLoading={loading}
        >
          Sign Up
        </Button>
      </VStack>
    </>
  );
};

export default RegisterPage;
