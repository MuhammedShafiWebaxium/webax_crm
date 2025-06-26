import { axiosInstance } from '../utils/config';

export const createUser = (formData) => {
  return axiosInstance.post('users', formData);
};

export const getUserFormData = (id) => {
  return axiosInstance.get(`users/form?id=${id}`);
};

export const getAllUsers = () => {
  return axiosInstance.get('users');
};

export const updateUser = (id, formData) => {
  return axiosInstance.patch(`users/${id}`, formData);
};

export const deleteUser = (id) => {
  return axiosInstance.delete(`users/${id}`);
};
