import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor untuk menangani respons dan error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika error response status 401 (Unauthorized), hapus token dan redirect ke login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Gunakan pengecekan untuk tidak redirect jika sudah di halaman login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// AI recommendation function
export const getTruckRecommendation = async (weight) => {
  try {
    const response = await api.post('/api/ai/recommend', { weight });
    return response.data;
  } catch (error) {
    console.error('Error getting truck recommendation:', error);
    throw error;
  }
};

export default api;