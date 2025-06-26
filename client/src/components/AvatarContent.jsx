import { Avatar, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import webaxLogoWhite from '../assets/webax-logo-white.webp';
import webaxLogoWhiteSm from '../assets/webax-logo.png';
import webaxLogoBlack from '../assets/webax-logo.png';
import webaxLogoBlackSm from '../assets/webax-logo.png';

export default function AvatarContent({ collapse }) {
  const theme = useTheme();

  const logo =
    theme.palette.mode === 'light'
      ? collapse
        ? webaxLogoWhiteSm
        : webaxLogoWhite
      : collapse
      ? webaxLogoWhiteSm
      : webaxLogoWhite;

  return (
    <Box
      sx={{
        display: 'flex',
        mt: 'calc(var(--template-frame-height, 0px) + 4px)',
        p: collapse ? 0.5 : 1.5,
      }}
    >
      <Avatar
        alt="EduAcharya"
        src={logo}
        sx={{ width: '100%', height: '100%', borderRadius: 0 }}
      />
    </Box>
  );
}
