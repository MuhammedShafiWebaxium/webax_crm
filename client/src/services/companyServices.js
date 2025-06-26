import { axiosInstance } from '../utils/config';

export const createCompany = (formData) => {
    return axiosInstance.post('companies', formData);
  };

  export const getAllCompanies = () => {
    return axiosInstance.get('companies/');
  };

  export const deleteCompany = (id) => {
    return axiosInstance.delete(`companies/${id}`);
  };
  
  export const getCompany = async (id) => {
    return axiosInstance.get(`/companies/${id}`);
  };

  export const updateCompany = async (id, data) => {
    return axiosInstance.patch(`/companies/${id}`, data);
  };