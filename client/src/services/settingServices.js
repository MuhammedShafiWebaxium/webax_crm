import { axiosInstance } from '../utils/config';

export const getAllRoles = () => {
  return axiosInstance.get('settings/roles');
};

export const createRole = (formData) => {
  return axiosInstance.post('settings/roles', formData);
};

export const updateRole = (id, formData) => {
  return axiosInstance.patch(`settings/roles/${id}`, formData);
};

export const deleteRole = (id) => {
  return axiosInstance.delete(`settings/roles/${id}`);
};

export const activateRole = (id) => {
  return axiosInstance.patch(`settings/roles/${id}/activate`);
};

export const getAllIntegrations = () => {
  return axiosInstance.get('settings/integrations');
};

export const createAdAccount = (formData) => {
  return axiosInstance.post('settings/integrations/ad-account', formData);
};

export const deleteAdAccount = (id) => {
  return axiosInstance.delete(`settings/integrations/${id}`);
};

export const activateAdAccount = (id) => {
  return axiosInstance.patch(`settings/integrations/${id}/activate`);
};