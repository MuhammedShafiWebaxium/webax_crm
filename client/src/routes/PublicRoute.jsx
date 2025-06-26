import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoute = () => {
  const { currentUser } = useSelector((state) => state.user);

  return currentUser ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;
