//1.user name, 2.email, 3.password, 4.pic
//Creating the schema for userModel.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Regular expression for validating email format
const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

// Regular expression for validating password format
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const userModel = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [emailRegex, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      match: [
        passwordRegex,
        "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character",
      ],
    },
    pic: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  {
    timestamps: true,
  }
);

//Means before saving the data into database. We are changing the plain text password into hash password.
userModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    //If no modification in password means then just stop the process using next middleware.
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log("Error : ", error);
    next(error); // Pass any error to the next middleware.
  }
});

//For checking the password === bcrypt password. This function was belongs to Controllers folder => userControllers.js file at line number 50. (authUser)function
userModel.methods.matchPassword = async function (enterdPassword) {
  return await bcrypt.compare(enterdPassword, this.password);
};

const User = mongoose.model("User", userModel);
module.exports = User;
