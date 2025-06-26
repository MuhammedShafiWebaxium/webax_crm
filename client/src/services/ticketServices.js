import { axiosInstance } from '../utils/config';

export const sentItTicket = (formData) => {
  return axiosInstance.post('/tickets/sent-it-ticket', formData);
};
