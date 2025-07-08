import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_URL = import.meta.env.VITE_API_URL;


export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
