import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js';
import { errorHandler } from '../utils/error.js';
import Listing from '../models/listing.model.js';

export const test = (req, res) => {
  res.json({
    message: 'Api route is working!',
  });
};

export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only update your own account!'));
  try {
    if (req.body.password) {//if user wants to update his password then we are hashing password
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      //for knowing which user we wanted to update
      req.params.id,
      {
        //$set will check if the data is changed or not. If it is changed then it will change otherwise it will ignore.
        $set: {
          //user can update username, email, password and avatar i.e. profile img
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }// it will save as new information in response for updated user
    );

    //here we are seperating password & other information
    const { password, ...rest } = updatedUser._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  //req.user.id we are getting from verifyUser from jwt && req.params.id we are getting from user.route
  if (req.user.id !== req.params.id)
    return next(errorHandler(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    //we are deleting cookie before sending json.
    //so we have to set header before response.
    res.clearCookie('access_token');
    //setting the response
    res.status(200).json('User has been deleted!');
  } catch (error) { 
    next(error);
  }
};

//show listings functionality
export const getUserListings = async (req, res, next) => {
  //req.user.id  we are getting from cookie(i.e. jwt) & req.params.id we are getting from user.route.js from listings route
  //are equal
  if (req.user.id === req.params.id) {
    try {
      //just find only the listings of the userRef
      //Here Listing is a model i.e. for information of particular listing
      const listings = await Listing.find({ userRef: req.params.id });
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandler(401, 'You can only view your own listings!'));
  }
};

export const getUser = async (req, res, next) => {
  try {
    
    const user = await User.findById(req.params.id);
  
    if (!user) return next(errorHandler(404, 'User not found!'));
  
    const { password: pass, ...rest } = user._doc;
  
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};
