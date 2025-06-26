import { Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const CustomLink = ({ linkText, linkUrl }) => {
  const theme = useTheme();
  return (
    <Link
      href={linkUrl}
      style={{
        textDecoration: 'none',
        color: theme.palette.mode === 'dark' ? '#4e9cff' : 'blue', // Adjust color based on mode
      }}
    >
      {linkText}
    </Link>
  );
};

export default CustomLink;
