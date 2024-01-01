import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';


//here next is the middleware
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  //after getting password from body we are simply hashing the password
  // hashSync means it awaits for the hash so we don't need to use await here. It is alraedy here
  //Also we are adding salt here. Salt is no. of rounds for creating a salt.
  //Salt is just a salt number or variable which is going to be combined with password and make it encrypted
  const hashedPassword = bcryptjs.hashSync(password, 10);
  
  // //validating email
  // const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  // if(!email.match(emailPattern)){
  //   return res.status(403).send({message: "Invalid Email. Email must contain @ and ."});
  // }
  // else if(password.length<8){//validating password
  //   return res.status(403).send({message:"Password should have atleast 8 characters."})
  // }
  // const specialCharCount = password.replace(/[^!@#$%^&*()_+]/g, '').length;
  // const uppercaseCount = password.replace(/[^A-Z]/g, '').length;
  // if (specialCharCount < 2 || uppercaseCount < 1) {
  //   return res.status(403).send({ message: "Password should have at least one UpperCase letter and two Special Characters."});
  // }

  //creting new user
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    //newUser.save() will save all information of user like username, email, password to mongodb database.
    //This saving will take time depending on internet speed.So, in order to prevent any 
    //error we can use await. So, code will will stay in the save line until operation gets finished.
    await newUser.save();// if we are using await function should be async
    res.status(201).json('User created successfully!');
  } catch (error) {
    next(error);//for handling error best practice is to use middleware and function
  }
};
 
//here email & password is coming from request.body that is from signup page
//we wanted to authenticate user using email and password. 
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    //here we are checking the email of user if there exits same email in database or not
    //there is method in mongoose called findOne for checking email.
    //we can do like email:email but after ES6 if same key & value is there we can eliminate one of them.
    const validUser = await User.findOne({ email });
    //errorHandler is under utils/erro.js
    //404 is statuscode and after that is error message.
    if (!validUser) return next(errorHandler(404, 'User not found!'));
    //password from body is plain password but password from database is hashed password.
    //so we are comparing passsword we are getting from body & one which is there in database.
    const validPassword = bcryptjs.compareSync(password, validUser.password);

    if (!validPassword) return next(errorHandler(401, 'Incorrect Credentials!'));
    //The way we authenticate the user is to add the cookie inside the browser.
    //And also we need to create hashed token that includes email of user or id of user.
    //And then we save this token inside browser.
    //So, each time user wants to change email or password. We need to check if they are authenticated are not.
    //So, by using that cookie we can do that.
    //So, we are not storing data as it is we are hashing that data & then storing
    //So for doing that we can use package called jwt(json web tokens).
    //id will be generated unique for all users in the mondodb database. 
    //id is being stored in mongodb as _id.
    //Also we have added secret key which is unique for application.
    //So, this will make token completely unique for our application.
    //We are storing secret key in .env file for security purpose.
    //inside cookie we are hashing user id and saving it as access_token which is created using jwt
    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    //this is for not sending password in response
    //we have seperated password and rest of the information
    //._doc is for destructuring 
    const { password: pass, ...rest } = validUser._doc;
    res
    //So, now we have cookie inside a browser.
    //only http can assess our token so, no other third party can access it.
    //we are saving token inside cookie.
    //httpOnly: true for making cookie safer.
      .cookie('access_token', token, { httpOnly: true })//session
      .status(200)
      .json(rest);//we are returning all things except password
  } catch (error) {//we are handling error using middleware next which we have created in index.js
    next(error);
  }
};

//for google authentication using firebase
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {//if user exists we wanted to register a user
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res
      //name of cookie is access_token
        .cookie('access_token', token, { httpOnly: true })
        .status(200)// we are sending status of 200
        .json(rest);// Also we are sending back user data
    } else {//if user doesn't exist we wanted to create new one
      //inside user.model.js we have written password is required
      //But when we authenticate using google we don't get any password
      //So, we have to generate password. And later if user wants to update password they can update that.
      const generatedPassword =
      //36 means numbers from 0 to 9 and letters from a to g and we want last 8 digits
      //so, for that we have used slice(-8)
      //For making password more secure we have used it twice & made it 16 characters long.
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
        //Hash the password.
        //We have 10 round of salts to combine it with password.
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({//save new user
        username://here we are converting name to username
        //if user has written Pratik Gaikwad
        //we wanted to make it as pratikgaikwad1234dsfgjhh
        //So, we wanted to make it lowercase with no space & also we have added some numbers & chracters at the
        //end to make it unique
          req.body.name.split(' ').join('').toLowerCase() +
          Math.random().toString(36).slice(-4),// we have added 4 digits at the end
          email: req.body.email,
          password: hashedPassword,
          avatar: req.body.photo,
      });
      await newUser.save();//saving the new user
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res
      //httpOnly: true for making token secure
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req, res, next) => {
  try {
    //we are just clearing the cookie for signOut
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (error) {
    next(error);
  }
};
