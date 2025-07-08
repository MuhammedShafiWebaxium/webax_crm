import { axiosInstance } from '../utils/config';

export const getAllNotifications = () => {
  return axiosInstance.get('notifications');
};

export const markAsRead = (id) => {
  return axiosInstance.patch(`notifications/${id}/mark-as-read`);
};

export const markAllAsRead = () => {
  return axiosInstance.patch(`notifications/mark-all-as-read`);
};

export const markAsDelete = (id) => {
  return axiosInstance.delete(`notifications/${id}/mark-as-delete`);
};