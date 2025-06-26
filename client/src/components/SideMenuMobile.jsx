import * as React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import GetAppIcon from '@mui/icons-material/GetApp';

import MenuButton from './MenuButton';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import { useDispatch, useSelector } from 'react-redux';
import { logOut } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import Notifications from './CustomComponents/Notifications';

function SideMenuMobile({ open, toggleDrawer }) {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [deferredPrompt, setDeferredPrompt] = React.useState(null);

  const [showButton, setShowButton] = React.useState(false);

  const { currentUser } = useSelector((state) => state.user);

  React.useEffect(() => {
    if (typeof window === 'undefined') return; // Ensure we're in a browser

    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log('User choice:', choiceResult);
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('user');
    dispatch(logOut());

    navigate('/login');
  };
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1 }}
          >
            <Avatar
              sizes="small"
              alt={currentUser?.userName?.firstName}
              src="/static/images/avatar/7.jpg"
              sx={{ width: 24, height: 24 }}
            />
            <Typography component="p" variant="h6">
              {currentUser?.userName?.firstName}
            </Typography>
          </Stack>
          {showButton && (
            <MenuButton onClick={handleInstall}>
              <GetAppIcon />
            </MenuButton>
          )}
          <Notifications />
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent />
          <Divider />
        </Stack>
        <CardAlert />
        <Stack sx={{ p: 2 }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LogoutRoundedIcon />}
            onClick={handleLogOut}
          >
            Logout
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

SideMenuMobile.propTypes = {
  open: PropTypes.bool,
  toggleDrawer: PropTypes.func.isRequired,
};

export default SideMenuMobile;
