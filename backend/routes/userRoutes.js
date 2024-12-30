const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userControllers");
const protect = require("../middleware/authMiddleware.js");

const router = express.Router();

router.route("/").post(registerUser); //Register user("/") Route. And here registerUser(user register) is the contorller for that userRegiter route.

router.post("/login", authUser); //Login user("/login") Route. And here authUser(user login) is the contorller for that authUser route.

router.route("/").get(protect, allUsers); //Search user("/") Route. And here allUsers is the contorller for that allUsers route.

module.exports = router;
