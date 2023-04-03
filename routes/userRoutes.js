import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userModel.js';
import { generateToken } from '../utils.js';

const userRouter = express.Router();

userRouter.post('/signin',(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    console.log(user) //נגיד אם יש משתמש על פי האימייל שלו
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) { //בכדי להשוות בין הסיסמה שכתב השתמש לסיסמה במסד compareSync נשתמש בפונקציה של 
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
    res.status(401).send({ message: 'Invalid email or password' });
  })
); export default userRouter;