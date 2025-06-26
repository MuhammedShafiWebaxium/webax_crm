import { Outlet } from 'react-router-dom';
import CustomizedSnackbar from '../components/CustomComponents/CustomSnackbar';

const AuthLayout = () => {
  return (
    <>
      {/* Common Alert Start*/}
      <CustomizedSnackbar />
      {/* Common Alert End*/}

      <Outlet />
    </>
  );
};

export default AuthLayout;
