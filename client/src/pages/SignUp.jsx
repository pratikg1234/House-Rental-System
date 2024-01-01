import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    // Password must be 8 characters long
    if (password.length < 8) {
      setError((prevErrors) => ({
        ...prevErrors,
        password: 'Password must be at least 8 characters long',
      }));
      return;
    }

    // Password should contain at least 2 special characters and 1 uppercase letter
    const specialCharCount = password.replace(/[^!@#$%^&*()_+]/g, '').length;
    const uppercaseCount = password.replace(/[^A-Z]/g, '').length;

    if (specialCharCount < 2 || uppercaseCount < 1) {
      setError((prevErrors) => ({
        ...prevErrors,
        password: 'Password should contain 2 special characters and 1 uppercase letter',
      }));
    } else if(specialCharCount >= 2 || uppercaseCount > 1 && password.length){
      setError((prevErrors) => ({
        ...prevErrors,
        password: '',
      }));
    }
  };

  const validateEmail = (value) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!value.match(emailPattern)) {
      setError((prevErrors) => ({
        ...prevErrors,
        email: 'Email must contain "@" and "."',
      }));
    } else {
      setError((prevErrors) => ({
        ...prevErrors,
        email: '',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'email') {
      validateEmail(value);
    } 
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    //prevent the refreshing of the page
    e.preventDefault();

    //if user has not entered username or password 
    if (!formData.email) {
      setError({
        email: 'Username,Email and password are required to sign up',
      });
      return;
    }
    else if(!formData.password){
      setError({
        password: 'Username,Email and password are required to sign up',
      });
      return;
    }

    try {
      setLoading(true);

      //we have made the proxy of /api inside vite.config.js which will add localhost:3000 everytime it sees the /api in the route
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //stringify is used for securely sending the data
        body: JSON.stringify(formData),
      });

      //change and convert the response to json
      const data = await res.json();

      if (data.success === false) {
        setLoading(false);
        setError({ email: data.message });
        setError({ password: data.message });
        return;
      }

      setLoading(false);
      setError({ email: '', password: '' });
      navigate('/sign-in');//if everything is fine we wanted to navigate to sign-in page
    } catch (error) {
      setLoading(false);
      setError({ email: 'All fields are Required', password: '' });
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>Sign Up</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='text'
          placeholder='username'
          className='border p-3 rounded-lg'
          name='username'
          onChange={handleChange}
        />
        <input
          type='email'
          placeholder='email'
          className='border p-3 rounded-lg'
          name='email'
          value={formData && formData.email}
          onChange={handleChange}
        />

        <input
          type='password'
          placeholder='password'
          className='border p-3 rounded-lg'
          name='password'
          value={formData && formData.password}
          onChange={handleChange}
        />

        <button
        //Button will get disabled when loading is there
          disabled={loading}
          className='bg-orange-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth />
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Already have an account?</p>
        <Link to='/sign-in'>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
      {error.email && <p className='text-red-500 mt-5'>{error.email}</p>}
      {error.password && <p className='text-red-500 mt-5'>{error.password}</p>}
    </div>
  );
}
