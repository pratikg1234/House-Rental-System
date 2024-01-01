import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  //this function is asynchronous because we need to wait for google to respond 
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      //inside firebase.js we have exported app which includes all information about firebase config
      const auth = getAuth(app);

      //signInWithPopup will show us popup window when we click on continue with google
      const result = await signInWithPopup(auth, provider);

      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          //we are sending 3 things name, email, photoURL to backend
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      //after getting response we are converting to json 
      const data = await res.json();
      dispatch(signInSuccess(data));
      navigate('/');//after successful sign-in with google we are navigating to home page
    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };
  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      className='bg-purple-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
    >
      Continue with google
    </button>
  );
}
