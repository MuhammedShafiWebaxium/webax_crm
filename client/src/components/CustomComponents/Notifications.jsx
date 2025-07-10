import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import MenuButton from '../MenuButton';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import { Box, Divider, CircularProgress, Stack, Chip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllNotifications,
  markAllAsRead,
  markAsDelete,
  markAsRead,
} from '../../services/notificationServices';
import {
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  setNotifications,
} from '../../redux/notificationSlice';
import { useNavigate } from 'react-router-dom';

import { format, isToday, isYesterday, parseISO } from 'date-fns';

export function formatNotificationTime(dateStr) {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;

  if (isToday(date)) {
    return `Today, ${format(date, 'hh:mm a')}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'hh:mm a')}`;
  } else {
    return format(date, 'd MMM, yyyy');
  }
}

const getNotificationChipProps = (type) => {
  switch (type) {
    case 'Upcoming Lead Follow-up':
      return { label: 'Follow-Up', color: 'primary' };
    case 'New Lead Assigned':
      return { label: 'Lead Assigned', color: 'success' };
    case 'New Task Assigned':
      return { label: 'Task Assigned', color: 'error' };
    default:
      return { label: 'Notification', color: 'default' };
  }
};

export default function Notifications() {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { list, unread } = useSelector((state) => state.notification);

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [loading, setLoading] = React.useState(false);

  const handleClick = async (event) => {
    try {
      setAnchorEl(event.currentTarget);
      setLoading(true);

      const { data } = await getAllNotifications();

      const notifications = data?.notifications || [];
      const count = data?.unreadCount || 0;

      dispatch(setNotifications({ notifications, count }));
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async (id) => {
    try {
      const { data } = await markAllAsRead();

      if (data.status !== 'success') throw Error('Something went wrong.');

      dispatch(markAllNotificationsAsRead());
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const { data } = await markAsRead(id);

      if (data.status !== 'success') throw Error('Something went wrong.');

      dispatch(markNotificationAsRead(id));
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const handleMarkAsDelete = async (id) => {
    try {
      const { data } = await markAsDelete(id);

      if (data.status !== 'success') throw Error('Something went wrong.');

      dispatch(deleteNotification(id));
    } catch (error) {
      handleFormError(error, null, dispatch, navigate);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <MenuButton
        showBadge={true}
        badgeContent={unread}
        aria-describedby={id}
        onClick={handleClick}
      >
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
        <Box minWidth={320} maxWidth={320}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography>Notifications</Typography>
            {unread > 0 ? (
              <Typography
                sx={{
                  color: 'primary.main',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Typography>
            ) : (
              ''
            )}
          </Box>
          <Divider />

          <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 4,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : list.length > 0 ? (
              list.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom:
                      index !== list.length - 1 ? '1px solid #eee' : 'none',
                    backgroundColor: item.isRead ? '#f5f5f5' : '#e8f0ff',
                    '&:hover': {
                      backgroundColor: item.isRead ? '#eaeaea' : '#d6e5ff',
                      cursor: 'pointer',
                      '.action-icons': {
                        opacity: 1, // 👈 show on hover
                      },
                    },
                  }}
                  onClick={() => {
                    console.log('Notification clicked:', item.title);
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: item.isRead ? 400 : 600 }}
                    >
                      {item.title}
                    </Typography>

                    {/* Action icons container */}
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      className="action-icons"
                      sx={{
                        opacity: 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      {!item.isRead && (
                        <Tooltip title="Mark as read" arrow>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation(); // 👈 Prevent click bubbling
                              handleMarkAsRead(item?._id);
                            }}
                            sx={{
                              width: 22,
                              height: 22,
                              border: '1px solid #ccc',
                              borderRadius: '50%',
                              color: 'success.main',
                              minWidth: 0,
                              padding: 0,
                              '&:hover': {
                                backgroundColor: 'success.light',
                                borderColor: 'success.main',
                              },
                            }}
                          >
                            <CheckIcon sx={{ fontSize: '14px' }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Delete" arrow>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation(); // 👈 Prevent click bubbling
                            handleMarkAsDelete(item?._id);
                          }}
                          sx={{
                            width: 22,
                            height: 22,
                            border: '1px solid #ccc',
                            borderRadius: '50%',
                            color: 'error.main',
                            minWidth: 0,
                            padding: 0,
                            '&:hover': {
                              backgroundColor: 'error.light',
                              borderColor: 'error.main',
                            },
                          }}
                        >
                          <CloseIcon sx={{ fontSize: '14px' }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Typography
                    variant="body2"
                    sx={{ fontSize: 12, color: 'text.secondary' }}
                  >
                    {item.message}
                  </Typography>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={0.5}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 11, color: 'text.disabled' }}
                    >
                      {formatNotificationTime(item.createdAt)}
                    </Typography>

                    <Chip
                      size="small"
                      {...getNotificationChipProps(item.title)}
                      sx={{ fontSize: 10, height: 20 }}
                    />
                  </Stack>
                </Box>
              ))
            ) : (
              <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No new notifications
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Popover>
    </>
  );
}
