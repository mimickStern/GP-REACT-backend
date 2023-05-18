import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      resetPassword: false,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

export const createResetToken =  (user) => {
    
  return jwt.sign(
    {  _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      resetPassword: true },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
  );
   
};

export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
        const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else if (decode.resetPassword) {
                // grant access to reset password component
                return res.status(401).send({ message: 'Access denied. This token only allows you to reset your password.' }); }
            else {
                req.user = decode;
                next();
            }
        });
    } else {
        res.status(401).send({ message: 'No Token' });
      }
  };

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: "Invalid Admin Token" });
  }
};
