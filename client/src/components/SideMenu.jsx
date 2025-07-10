import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Avatar,
  Box,
  Divider,
  Drawer as MuiDrawer,
  Stack,
  Typography,
  Tooltip,
  Zoom,
  useTheme,
} from '@mui/material';
import { drawerClasses } from '@mui/material/Drawer';
import { useSelector } from 'react-redux';

import AvatarContent from './AvatarContent';
import MenuContent from './MenuContent';
import CardAlert from './CardAlert';
import OptionsMenu from './OptionsMenu';

const drawerWidth = 240;
const collapsedWidth = 70;

const StyledTypography = styled(Typography)(({ theme }) => ({
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: theme.palette.text.primary,
}));

const Drawer = styled(MuiDrawer)(({ theme }) => ({
  width: drawerWidth,
  display: { xs: 'none', md: 'block' },
  transition: (theme) =>
    theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  [`& .${drawerClasses.paper}`]: {
    backgroundColor: 'background.paper',
    transition: (theme) =>
      theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
  },
}));

export default function SideMenu({ collapse }) {
  const { currentUser } = useSelector((state) => state.user);
  const [onHover, setOnHover] = useState(false);

  const isCollapsed = collapse && !onHover;
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: isCollapsed ? collapsedWidth : drawerWidth,
        [`& .${drawerClasses.paper}`]: {
          width: isCollapsed ? collapsedWidth : drawerWidth,
        },
      }}
      onMouseEnter={() => collapse && setOnHover(true)}
      onMouseLeave={() => collapse && setOnHover(false)}
    >
      <Box
        sx={{
          display: 'flex',
          mt: 'calc(var(--template-frame-height, 0px) + 4px)',
          p: 1.5,
        }}
      >
        <AvatarContent collapse={isCollapsed} />
      </Box>

      <Divider />

      <MenuContent collapse={isCollapsed} />

      {!isCollapsed && <CardAlert />}

      <Stack
        direction="row"
        sx={{
          p: 2,
          gap: 1,
          alignItems: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Avatar
          alt={currentUser?.userName?.firstName || 'User'}
          // src="/static/images/avatar/7.jpg"
          sx={{ width: 36, height: 36 }}
        />
        {!isCollapsed && (
          <>
            <Box sx={{ mr: 'auto', overflow: 'hidden' }}>
              <Tooltip
                title={currentUser?.userName?.firstName || ''}
                TransitionComponent={Zoom}
                disableInteractive
              >
                <StyledTypography
                  variant="body2"
                  sx={{ fontWeight: 500, lineHeight: '16px' }}
                >
                  {currentUser?.userName?.firstName}
                </StyledTypography>
              </Tooltip>
              <Tooltip
                title={currentUser?.email || ''}
                TransitionComponent={Zoom}
                disableInteractive
              >
                <StyledTypography
                  variant="caption"
                  sx={{ color: 'text.secondary' }}
                >
                  {currentUser?.email}
                </StyledTypography>
              </Tooltip>
            </Box>
            <OptionsMenu />
          </>
        )}
      </Stack>
    </Drawer>
  );
}
