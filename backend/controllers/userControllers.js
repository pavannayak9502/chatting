const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken.js");

//For User Registration.
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    //If any fields empty which was filled by user then throw error to fill the details.
    res.status(400);
    throw new Error("Please Fill all the Fields");
  }

  //Check if user already exists in database(check from userModel).
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists!");
  }

  //No existing user means then create the new user and store the data into database.
  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create the user!");
  }
});

//For User Login.
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email & Password");
  }
});

//For Search User. http://localhost:5000/api/user?search=pavan  . At here we are instead of using post req we are using query params. (?=>query, search=>key, pavan=>value of that search key).
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("-password"); //Search the keyword from my entire database expect the current user logged in. After finding the keywords then send the response.
  res.send(users);
});

module.exports = { registerUser, authUser, allUsers };
