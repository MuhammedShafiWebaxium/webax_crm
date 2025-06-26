import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import MenuButton from '../MenuButton';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { Box, Divider } from '@mui/material';

export default function Notifications() {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <MenuButton showBadge aria-describedby={id} onClick={handleClick}>
        <NotificationsRoundedIcon />
      </MenuButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box minWidth={320}>
          <Typography sx={{ p: 2 }}>Notifications</Typography>
          <Divider />
        </Box>
      </Popover>
    </>
  );
}
