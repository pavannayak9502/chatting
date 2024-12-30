//This middleware is only for verfing the jwt token for the current logged in user.
//User info using query. Ex: /api/user?search=pavan //We are taking the query from our api. (Instead of using a single param we are using query request).
//At here we want all searched users expect the person(user) who was login. (From controllers floder => userControllers.js file code line 75).
//Authoriztion middleware is used for is user login or not logined.

const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token; //Empty variable we are going to use it for store the jwt text value.

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //Jwt token contains like this : token = Bearer abcdefghijklmnopqrstuvwxyz. (.split(" ")[1] means we are removing the Bearer and store the remaing text value jwt into token variable.)
      token = req.headers.authorization.split(" ")[1];

      //Decodes the token id. (jwt.verify(passToken, secretKey));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      //Declaring an user variable inside the req. Using mongodb syntax we are finding the verified user decoded._id.
      req.user = await User.findById(decoded.id).select("-password");

      next(); //If all works good then go onto next() operation.
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed!");
    }
  }

  //If the above condition not satisfied then again we need to display the error.
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = protect;
