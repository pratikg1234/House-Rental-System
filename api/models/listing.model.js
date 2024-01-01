import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    type: {//type will be rent or sell
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {//we wanted to keep track of which user has created listing
      type: String,
      required: true,
    },
    halls: {
      type: Number,
      required: true,
    },
    kitchens: {
      type: Number,
      required: true,
    }
    
  },// timestamps: true will store time of creation & updation
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
