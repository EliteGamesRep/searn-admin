import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.searn.io/api', // Adjust if your backend is on another port or domain
  headers: {
    'Content-Type': 'application/json',
  },
});

// const api = axios.create({
//   baseURL: 'https://api.bitcoingames.shop/api', // Adjust if your backend is on another port or domain
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// const api = axios.create({
//   baseURL: 'http://localhost:3000/api', // Adjust if your backend is on another port or domain
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// Attach token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => {
  console.log("Error>>>>>>ss",error);
  return Promise.reject(error);
});

// Handle responses globally if needed
api.interceptors.response.use(
  response => response,
  error => {
    console.log("Error>>>>>>",error);
    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized, redirecting to login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('admin_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

