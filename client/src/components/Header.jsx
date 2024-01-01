import { FaSearch } from 'react-icons/fa';//we are using fonts from font awsome website
import { Link, useNavigate } from 'react-router-dom';// Link will bring from one page to other without refershing page
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export default function Header() {

  //useSelector() is from react-redux
  //The useSelector hooks allow you to extract data or the state from the Redux store using a selector function. 
  //It is equivalent to the mapStateToProps argument used in the connect() function conceptually.
  //useSelector will do a reference comparison (===) of the previous selector result.
  const { currentUser } = useSelector((state) => state.user);

  //state for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    //we can get the URL data from URLSearchParams
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {//for seeing search term inside search and url
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);
  return (
    <header className='bg-pink-400 shadow-md'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
        {/* / is for home route */}
        <Link to='/'>
          <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
            <span className='text-blue-300'>Rent</span>
            <span className='text-green-300'>Ease</span>
          </h1>
        </Link>
        <form
          onSubmit={handleSubmit}
          className='bg-slate-100 p-3 rounded-lg flex items-center'
        >
          <input
            type='text'
            placeholder='Search...'
            //w-24 for mobile sizes and for bigger screen sm:w-64
            className='bg-transparent focus:outline-none w-24 sm:w-64'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button>
            <FaSearch className='text-blue-300' />
          </button>
        </form>

        <ul className='flex gap-4'>
          <Link to='/'>
            <li className='hidden sm:inline text-orange-200 hover:underline'>
              Home
            </li>
          </Link>
          <Link to='/about'>
            <li className='hidden sm:inline text-orange-200 hover:underline'>
              About
            </li>
          </Link>
          <Link to='/profile'>
            {currentUser ? (//if user is signed in it will go to /ptofile page
              <img
              //object-cover to keep aspect ratio of img
                className='rounded-full h-7 w-7 object-cover'
                src={currentUser.avatar}
                alt='profile'
              />
            ) : (//otherwise it will go to sign-in
              <li className=' text-orange-200 hover:underline'> Sign in</li>
            )}
          </Link>
        </ul>
      </div>
    </header>
  );
}
