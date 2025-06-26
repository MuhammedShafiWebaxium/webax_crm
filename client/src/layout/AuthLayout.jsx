import { Outlet } from 'react-router-dom';
import CustomizedSnackbar from '../components/customComponents/CustomSnackbar';

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
