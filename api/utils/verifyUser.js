import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  //name of token is access_token
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, 'Unauthorized'));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //if there is error we are returning new error of 403
    if (err) return next(errorHandler(403, 'Forbidden'));

    //if there is no error we are sending it to next function
    //we are sending it inside the request
    req.user = user;
    //if we have sucessfully verified user then we are going to next function i.e. updateUser
    next();
  });
};
