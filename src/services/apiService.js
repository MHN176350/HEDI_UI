import apiClient from './axiosInstance';

export const apiService = {
  getMetrics: async () => {
    const response = await apiClient.get('/metrics');
    return response.data; 
  },
  
  getUserRecords: async (userId) => {
    const response = await apiClient.get(`/records/user/${userId}`);
    return response.data; 
  },
  
  saveRecord: async (userId, recordData) => {
    const response = await apiClient.post(`/records/user/${userId}`, recordData);
    return response.data;
  },
  
  saveThresholds: async (userId, thresholdDataArray) => {
    const response = await apiClient.post(`/thresholds/user/${userId}/batch`, thresholdDataArray);
    return response.data; 
  }
};