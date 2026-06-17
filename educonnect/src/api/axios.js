import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Automatically attach the access token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Catch 401 errors and silently refresh using the refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');

      if (refresh) {
        try {
          const refreshUrl = `${BASE_URL}/auth/token/refresh/`;
          
          // Use a clean axios instance here to avoid intercepting this specific call
          const res = await axios.post(refreshUrl, { refresh: refresh });
          
          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);
          
          // Update the original request's authorization header and retry it
          original.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(original);
        } catch (refreshError) {
          console.error('Refresh token expired or invalid:', refreshError);
          handleForcedLogout();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available in storage, force logout immediately
        handleForcedLogout();
      }
    }
    return Promise.reject(error);
  }
);

// Helper to clear tokens and force a clean reload back to the login page
function handleForcedLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
  window.location.href = '/login';
}

export default api;