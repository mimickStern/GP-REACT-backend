import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { createResetToken, generateToken, isAdmin, isAuth } from "../utils.js";

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

userRouter.post("/forgot-pwd", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    res.send({
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      token: createResetToken(user),
    });
    return;
  }
  res.status(401).send({ message: "Invalid email" });
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

userRouter.put("/profile", isAuth, async (req, res) => {
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
    res.status(404).send({ message: "User not found" });
  }
});

userRouter.put("/:id", isAuth, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);
    const updatedUser = await user.save();
    res.send({ message: "User Updated", user: updatedUser });
  } else {
    res.status(404).send({ message: "User Not Found" });
  }
});

userRouter.delete("/:id", isAuth, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.email === "admin@example.com" || user.isAdmin) {
      res.status(400).send({ message: "Can Not Delete Admin User" });
      return;
    }
    await user.deleteOne();
    res.send({ message: "User Deleted" });
  } else {
    res.status(404).send({ message: "User Not Found" });
  }
});

userRouter.get("/", isAuth, isAdmin, async (req, res) => {
  const users = await User.find({});
  res.send(users);
});

userRouter.get("/:id", isAuth, isAdmin, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.send(user);
  } else {
    res.status(404).send({ message: "User Not Found" });
  }
});

export default userRouter;
