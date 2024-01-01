import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);//req.body we are getting from browser.
    return res.status(201).json(listing);//listing is created
  } catch (error) {//middleware will hanle the error
    next(error);
  }
};

//for deleting listing from show listings button for specific id
export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.user.id !== listing.userRef) {//userRef is already string so we dont need to convert it to string
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {//if everything is OK
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

//editing the listing under show listing
export const updateListing = async (req, res, next) => {
  //
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }
  if (req.user.id !== listing.userRef) {
    return next(errorHandler(401, 'You can only update your own listings!'));
  }

  try {
    //findByIdAndUpdate is a method used to find by id and then update that
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }//for getting new updated listing
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};


//for getting information of specific listing
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    //if there is a limit then parse it to integer. Otherwise use 9 as limit
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;

    //if offer is not clicked then search for listings which has both offer and not
    if (offer === undefined || offer === 'false') {
      //$in is for searching inside database
      offer = { $in: [false, true] };//offer can be true or false 
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

    const searchTerm = req.query.searchTerm || '';

    //we wanted to sort by latest
    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = await Listing.find({
      //regex is builtin search functionality for mongoDB
      //we can search for part of the word using regex
      name: { $regex: searchTerm, $options: 'i' },//'i' means search will not depend on lowercase or uppercase.
      offer,
      furnished,
      parking,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
