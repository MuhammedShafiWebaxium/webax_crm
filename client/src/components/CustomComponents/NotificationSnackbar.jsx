import * as React from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { Paper, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const NotificationTrigger = ({ notification }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleNavigate = (link) => {
    if (link) {
      navigate(link);
    }
  };

  React.useEffect(() => {
    if (notification) {
      enqueueSnackbar('', {
        content: (key) => (
          <Paper
            key={key}
            elevation={3}
            onClick={() => handleNavigate(notification?.link)}
            sx={{
              backgroundColor: '#fff',
              p: 2,
              borderRadius: 1,
              minWidth: 350,
              maxWidth: 350,
              boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <Box sx={{ pr: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 0.5, color: '#0853ed' }}
              >
                {notification.title}
              </Typography>
              <Typography variant="body2">{notification.message}</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                closeSnackbar(key);
              }}
              sx={{ ml: 1, mt: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Paper>
        ),
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'right',
        },
        autoHideDuration: null,
      });
    }
  }, [notification, enqueueSnackbar, closeSnackbar]);

  return null;
};

const NotificationSnackbar = ({ notification }) => (
  <SnackbarProvider maxSnack={3} style={{ bottom: '40px' }}>
    <NotificationTrigger notification={notification} />
  </SnackbarProvider>
);

export default NotificationSnackbar;
