import { axiosInstance } from '../utils/config';

export const createLead = (formData) => {
  return axiosInstance.post('leads', formData);
};

export const getLeadFormData = (id) => {
  return axiosInstance.get(`leads/form?id=${id}`);
};

export const getLead = (id) => {
  return axiosInstance.get(`leads/${id}`);
};

export const getAllLeads = () => {
  return axiosInstance.get('leads');
};

export const updateLead = (id, formData) => {
  return axiosInstance.patch(`leads/${id}`, formData);
};

export const followupLead = (id, formData) => {
  return axiosInstance.patch(`leads/${id}/followup`, formData);
};

export const deleteLead = (id) => {
  return axiosInstance.delete(`leads/${id}`);
};

export const setAssignee = (formData) => {
  return axiosInstance.patch(`leads/${formData?.studentId}/set-assignee`, formData);
};
