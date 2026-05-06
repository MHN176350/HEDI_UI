import apiClient from './axiosInstance';

export const authService = {
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data; 
  },
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; 
  },
  oauthCallback: async (oauthData) => {
    const response = await apiClient.post('/auth/oauth/callback', oauthData);
    return response.data;
  },
  logout: async (userId) => {
    const response = await apiClient.post(`/auth/logout/${userId}`);
    return response.data;
  }
};