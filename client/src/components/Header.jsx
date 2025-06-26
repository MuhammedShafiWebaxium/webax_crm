import * as React from 'react';
import Stack from '@mui/material/Stack';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import ColorModeIconDropdown from '../theme/shared/ColorModeIconDropdown';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';

import Search from './Search';
import CustomDateRange from './customComponents/CustomDateRange';
import Notifications from './customComponents/Notifications';
import SortSharpIcon from '@mui/icons-material/SortSharp';
import NotesSharpIcon from '@mui/icons-material/NotesSharp';
import { Box, InputLabel } from '@mui/material';

import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MenuButton from './MenuButton';

export default function Header({ collapse, setCollapse }) {
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullScreen(true));
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        // maxWidth: { sm: '100%' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <Stack direction={'row'} gap={1} alignItems={'center'}>
        <Box sx={{ width: '34px', height: 'max-content' }}>
          <InputLabel
            id="menu-btn-label"
            htmlFor="check"
            sx={(theme) => ({
              m: 0,
              '& span': {
                background: theme.palette.mode === 'dark' ? '#fff' : '#000',
              },
            })}
          >
            <input
              type="checkbox"
              id="check"
              onClick={() => setCollapse(!collapse)}
            />
            <span></span>
            <span></span>
            <span></span>
          </InputLabel>
        </Box>

        <NavbarBreadcrumbs />
      </Stack>
      <Stack direction="row" sx={{ gap: 1 }}>
        <Search />
        <CustomDateRange />
        <MenuButton aria-label="Full screen" onClick={toggleFullScreen}>
          {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </MenuButton>
        <Notifications />
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
