import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const LOCALE_URL = import.meta.env.VITE_LOCALE_URL;

export const axiosInstance = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});
