import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import path from 'path';
dotenv.config();

mongoose
//to hide password of mongodb we have created .env file and placed the url of database at that.
  .connect(process.env.MONGO)
  .then(() => {
    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

  //dynamic directory
  const __dirname = path.resolve();

const app = express();

//this will allow json as input of this server so that we can send the body from 
//insomnia api testing tool and we can see the results in terminal.
app.use(express.json());

//cookieParser is for getting information from cookie.
app.use(cookieParser());

app.listen(3000, () => {
  console.log('Server is running on port 3000!');
});

//here app.use means we are using user router that we have created in user.route.js file. And same for others
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);// this is auth route for authentication
app.use('/api/listing', listingRouter);// this is route for listing

//we are creating the static folder for deploting purpose on render
app.use(express.static(path.join(__dirname, '/client/dist')));

//request is data that we get from client side(browser)
//response is data we sent back from server side 

//we are joining the dynamic directory name with 'client', 'dist', 'index.html'
//so any address that is not /api/user or /api/auth or /api/listing then it will go to this address
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})

//middleware 
//we wiil be having error,request, 
//error will be coming from input of middleware which is error that we sent to middleware.
//request is data from browser(client)
//response is response from server to client side
//we use next to go to the next middleware 
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;//statusCode is statusCode that we get from input of middleware.
  // and if there is no statusCode then simply use 500 errorcode which is internal server error
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,//we can write statusCode: statusCode but after ES6 if variable & key has same name we can just remove one of them.
    message,
  });
});
