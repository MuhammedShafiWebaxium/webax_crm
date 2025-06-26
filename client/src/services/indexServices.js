import { axiosInstance } from '../utils/config';

export const loginUser = (formData) => {
  return axiosInstance.post('login', formData);
};

export const getDashboard = () => {
  return axiosInstance.get('/');
};
