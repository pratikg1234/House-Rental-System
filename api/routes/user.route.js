import express from 'express';//express for creating route
import { deleteUser, test, updateUser,  getUserListings, getUser} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
 
const router = express.Router();

//if we just wanted to get information and don't wanted to send information we can use get
//If we wanted to send to database we can use post method
router.get('/test', test);//it will go to user.controller.js and inside test function and returns json
router.post('/update/:id', verifyToken, updateUser)//update api route. id for updating unique user
router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id', verifyToken, getUserListings)//here we are just getting information
router.get('/:id', verifyToken, getUser)

export default router;