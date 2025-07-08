import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  unread: 0,
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new incoming notification
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unread += 1;
      }
    },

    // Add many notifications at once (e.g., on load)
    setNotifications: (state, action) => {
      state.list = action.payload.notifications;
      state.unread = action.payload.count;
    },

    // Mark one notification as read
    markNotificationAsRead: (state, action) => {
      const notification = state.list.find((n) => n._id === action.payload);
      if (notification && !notification.isRead) {
      notification.isRead = true;
      state.unread = Math.max(0, state.unread - 1);
      }
    },

    // Mark all notifications as read
    markAllNotificationsAsRead: (state) => {
      state.list.forEach((n) => {
      n.isRead = true;
      });
      state.unread = 0;
    },

    // Delete a notification
    deleteNotification: (state, action) => {
      const deleted = state.list.find((n) => n._id === action.payload);
      if (deleted && !deleted.isRead) {
        state.unread = Math.max(0, state.unread - 1);
      }
      state.list = state.list.filter((n) => n._id !== action.payload);
    },

    // Clear all notifications (e.g., on logout)
    clearNotifications: (state) => {
      state.list = [];
      state.unread = 0;
    },
  },
});

export const {
  addNotification,
  setNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
