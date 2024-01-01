import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    //username and email must be unique
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar:{
      type: String,
      //if user doesn't have any avatar then we are adding default avatar
      default: "https://media.istockphoto.com/vectors/profile-anonymous-face-icon-gray-silhouette-person-male-businessman-vector-id965743490?k=6&m=965743490&s=170667a&w=0&h=RT-mOJ6--1NlwHTeXujMW3eC5dxCajHdaR6gEJi2jvU="
    },
  },
  // timestamps: true will tell mongodb to record 2 important extra information
  // 1. time of creation of user
  // 2. time of updation of user
  // So, later if we wanted to sort these information we can use two extra info to be able to 
  // easily sort them by time and latest 
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

//export default is for using this model anywhere in the application
export default User;

