import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);//initialize to empty array
  const dispatch = useDispatch();

  // firebase storage
  // allow read;
  // allow write: if
  // request.resource.size < 2 * 1024 * 1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);

    //this will get current time of computer & add it to fileName. So, we will be having unique filename always
    const fileName = new Date().getTime() + file.name;

    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // progress is percentage of upload
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {//this is callback function
        //if upload is successful we want to get downloadURL
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })//... is spread operator which will keep track of
          //any changes in username, email. 
        );
      }
    );
  };
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();//prevent default behaiviour of submission which is refreshing th page
    try {
      dispatch(updateUserStart());//loading effect is going to start
      //currentUser we got from react redux toolkit
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //we have saved everything inside formData.So, we are sending formData.
        body: JSON.stringify(formData),
      });
      //getting data by converting to json
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      //if everything is OK
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  //func for deleting user
  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      //creating request
      //we are passing id of the user
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  //when signout button is clicked
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      //if everything is OK
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };

  //function for showing listings
  const handleShowListings = async () => {
  
    try {
      //first clean previous error
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      //creating data by converting it to json
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      //if everything is OK then we are storing in setUserListings whatever data we are getting
      //setUserListings is a piece of state.
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };


  //for delelting any listing under show listings 
  const handleListingDelete = async (listingId) => {
    try {//listingId is id for which we wanted to delete the listing
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      //In WListings we are setting state where id expect the id which is being deleted.
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          //when we click on 
         ref={fileRef}
          hidden
          //it should only access images
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          //if formData.avatar is present then we will show formData.avatar
          //otherwise we will show currentUser.avatar
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24  w-24 object-cover cursor-pointer self-center mt-2'
        />
        <p className='text-sm self-center'>
          {fileUploadError ? (//if there is an error while uploading the
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>
        <input
          type='text'
          placeholder='username'
          //currentUser.username will show current users username in username field
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          id='email'
          //it will show current users email in email field
          defaultValue={currentUser.email}
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='password'
          onChange={handleChange}
          id='password'
          className='border p-3 rounded-lg'
        />
        <button
          //when loading is true Update button should be disabled
          disabled={loading}
          className='bg-red-600 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
          {/* when loading is there we will see loading otherwise Update */}
          {loading ? 'Loading...' : 'Update'}
        </button>
        <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95 '
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>
      {/* we can bring Delete account and Sign out infront of each other using flex */}
      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDeleteUser}
          className='text-orange-700 md:font-bold camelcase cursor-pointer'
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className='text-orange-700 md:font-bold camelcase cursor-pointer'>
          Sign out
        </span>
      </div>

      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
      <button onClick={handleShowListings} className='bg-blue-500 text-white p-1 rounded-lg camelcase text-center hover:opacity-95 w-full'>
        Show Listings
      </button>
      <p className='text-red-700 mt-5'>
        {showListingsError ? 'Error showing listings' : ''}
      </p>
      
      {/* first we are checking whether user exists or not. And then we are checking if more than 0 listings are there */}
      {userListings && userListings.length > 0 && (
        <div className='flex flex-col gap-4'>
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            Your Listings
          </h1>
          {userListings.map((listing) => (//this will five each listing
            <div
              key={listing._id}
              className='border border-yellow-500 rounded-lg p-3 flex justify-between items-center gap-4'
            >
              {/* when we click on listing we will go to that listing */}
              <Link to={`/listing/${listing._id}`}>
                <img
                //we are showing only first img as cover for the particular listing
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='h-29 w-20 object-contain'
                />
              </Link>
              <Link
              //name of listing
              //truncate means if title is too long it will show ... at the end.
                className='text-blue-600 font-semibold  hover:underline truncate flex-1'
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button
                //callback function
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-600 uppercase md:font-bold'
                >
                  Delete
                </button>
                {/* for edit button in show listing*/}
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-600 uppercase md:font-bold'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
