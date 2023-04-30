import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken, isAuth } from "../utils.js";

const userRouter = express.Router();

userRouter.post("/signin", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  console.log(user); //נגיד אם יש משתמש על פי האימייל שלו
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      //בכדי להשוות בין הסיסמה שכתב השתמש לסיסמה במסד compareSync נשתמש בפונקציה של
      res.send({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user), //generateToken בשביל המשתמש בהמשך ניצור את JesonWebToken ניצור
      });
      return;
    }
  }
  res.status(401).send({ message: "Invalid email or password" });
});

userRouter.post("/signup", async (req, res) => {
  const userExist = await User.findOne({
    $or: [{ email: req.body.email }, { username: req.body.username }],
  });
  if (userExist) {
    return res
      .status(401)
      .json({ message: `username or email already exists` });
  } else {
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      isAdmin: false,
      token: generateToken(user),
    });
  }
});

userRouter.put('/profile', isAuth, (async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password, 8);
    }

    const updatedUser = await user.save();
    res.send({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: false,
      token: generateToken(updatedUser),
    });
  } else {
    res.status(404).send({ message: 'User not found' });
  }}));


export default userRouter;
