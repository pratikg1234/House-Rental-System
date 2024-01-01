import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  //if there is current user then we wanted to show Outlet
  //otherwise we wanted user to navigate to sign-in page
  //Navigate is a component & useNavigate is a hook
  return currentUser ? <Outlet /> : <Navigate to='/sign-in' />;
}
