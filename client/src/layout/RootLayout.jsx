import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';

import Copyright from '../internals/components/Copyright';
import Preloader from './Preloader';
import useSocket from '../utils/useSocket';
import { setUser } from '../redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import SideMenu from '../components/SideMenu';
import AppNavbar from '../components/AppNavbar';
import { Stack } from '@mui/material';
import Header from '../components/Header';
import CustomizedSnackbar from '../components/CustomComponents/CustomSnackbar';
import { Outlet } from 'react-router-dom';
import { IconButton } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const RootLayout = () => {
  const dispatch = useDispatch();

  const ref = React.useRef();

  const { currentUser } = useSelector((state) => state.user);

  const [pos, setPos] = React.useState(false);

  const [collapse, setCollapse] = React.useState(false);

  // Connect to Socket.io and listen for user updates
  useSocket(currentUser._id, (updatedUserData) => {
    dispatch(setUser(updatedUserData)); // ✅ Correct Redux update
  });

  const handleTop = () => {
    ref.current.scrollTop = 0;
    setPos(false);
  };

  const handleScroll = () => {
    if (ref.current.scrollTop > 50) {
      if (!pos) setPos(true);
    } else {
      if (pos) setPos(false);
    }
  };

  React.useEffect(() => {
    const temp = ref.current;
    temp.addEventListener('scroll', handleScroll);
    return () => temp.removeEventListener('scroll', handleScroll);
  });

  return (
    <>
      <Preloader />

      <Box sx={{ display: 'flex' }}>
        <SideMenu collapse={collapse} />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            scrollBehavior: 'smooth',
            height: '100vh',
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
          ref={ref}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
              mb: '52px',
            }}
          >
            <Header collapse={collapse} setCollapse={setCollapse} />
            <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '2500px' } }}>
              {/* Common Alert Start*/}
              <CustomizedSnackbar />

              {/* Common Alert End*/}
              <Outlet />
              <Copyright sx={{ my: 4 }} />
            </Box>
          </Stack>
        </Box>

        <IconButton
          sx={{
            position: 'fixed',
            bottom: '30px',
            right: '40px',
            p: '7px',
            borderRadius: '50%',
            display: pos ? 'block' : 'none',
            transition: 'transform 0.2s ease-in-out',
            backgroundColor: 'hsl(210, 100%, 96%)',
            border: '1px solid hsl(210, 100%, 80%)',
            zIndex: 11,
            '&:hover': {
              transform: 'translateY(-5px)',
              backgroundColor: 'hsl(210, 100%, 90%)',
              border: '1px solid hsl(210, 100%, 80%)',
            },
          }}
          onClick={handleTop}
        >
          <ExpandLessIcon sx={{ color: 'hsl(210, 100%, 30%)' }} />
        </IconButton>
      </Box>
    </>
  );
};

export default RootLayout;
