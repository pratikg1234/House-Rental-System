import express from 'express';
import { createListing, deleteListing, updateListing, getListing, getListings } from '../controllers/listing.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

//If user is not wuthenticated then he will not be able to create listing. So, for checking whether user is authenticated or not 
//we are using verifyToken
router.post('/create', verifyToken, createListing);
//for deleting any listing after show listing. Also we are checking if user is authenticated or not.  
router.delete('/delete/:id', verifyToken, deleteListing);
//we are going to /update and we are passing params as id.
//this is for editing the listing under show listing
//this is for editing listing under show listing button
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);//based on id we will be getting information of listing
router.get('/get', getListings);//Searching the properties

export default router;
