import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://branda-backend.onrender.com/api';

let logoutCallback = null;

export const setLogoutCallback = (cb) => {
  logoutCallback = cb;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (logoutCallback) {
        logoutCallback();
      } else {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (!config || config.__isRetry) return Promise.reject(error);

    if (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      (error.response && error.response.status >= 500)
    ) {
      config.__isRetry = true;
      await new Promise(r => setTimeout(r, 1000));
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
