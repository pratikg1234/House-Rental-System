import express from 'express';
import { google, signOut, signin, signup } from '../controllers/auth.controller.js';

const router = express.Router();

//this will go to localhost:3000/api/auth/signup and same way for others.
router.post("/signup", signup);
router.post("/signin", signin);
router.post('/google', google);
router.get('/signout', signOut)//Here we are not sending any data, so we have used get method

export default router;