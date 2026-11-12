import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send and receive httpOnly cookies automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => {
    // Flatten envelope: if response has data.data, return that directly
    if (response.data && response.data.data !== undefined) {
      return {
        ...response,
        data: response.data.data,
        meta: response.data.meta,
      };
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      // Auto-redirect to login on unauthenticated request
      window.location.href = '/login';
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan pada sistem';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);
