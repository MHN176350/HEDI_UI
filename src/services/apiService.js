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
  
  // UPDATED: Now points to the new Tracked Metrics Batch endpoint
  saveThresholds: async (userId, thresholdDataArray) => {
    const response = await apiClient.post(`/tracked-metrics/user/${userId}/batch`, thresholdDataArray);
    return response.data; 
  },
  
  // UPDATED: Now fetches the Smart Analytics Profile instead of just min/max
  getUserThresholds: async(userId) => {
     const response= await apiClient.get(`/tracked-metrics/user/${userId}`);
     return response.data;
  },
  
  getLatestRecord: async (userId, metricName) => {
   const response= await apiClient.get(`/records/user/${userId}/metric/${metricName}/latest`);
   return response.data;
  },
  
  // UPDATED: Now updates the active status in the Tracked Metrics table
  updateThresholdSettings: async (userId, settingsBatch) => {
    const response = await apiClient.put(`/tracked-metrics/user/${userId}/settings`, settingsBatch);
    return response.data;
  },
  
  getNotifications: async (userId) => {
    const response = await apiClient.get(`/notifications/user/${userId}`);
    return response.data;
  },
  
  markNotificationsRead: async (userId) => {
    const response = await apiClient.put(`/notifications/user/${userId}/read`); // Added missing await
    return response.data;
  },
  
  getUserProfile: async (userId) => {
    const response = await apiClient.get(`auth/user/${userId}/profile`);
    return response.data;
  },
  
  updateUserProfile: async (userId, profileData) => {
    const response = await apiClient.put(`auth/user/${userId}/profile`, profileData);
    return response.data;
  },
  clearMetricRecords: async (userId, metricName) => {
    const response = await apiClient.delete(`/records/user/${userId}/metric/${metricName}`);
    return response.data;
  },
};