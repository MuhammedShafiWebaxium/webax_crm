import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

export default function HighlightedCard({
  title,
  icon,
  onClick,
  buttonName,
  description,
}) {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        {icon}
        <Typography
          component="h2"
          variant="subtitle2"
          gutterBottom
          sx={{ fontWeight: '600' }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: '8px' }}>
          {description}
        </Typography>
        <div style={{ flexGrow: 1 }} />
        <Box>
          <Button
            variant="contained"
            size="small"
            color="primary"
            endIcon={<ChevronRightRoundedIcon />}
            fullWidth={isSmallScreen}
            onClick={onClick}
          >
            {buttonName}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
