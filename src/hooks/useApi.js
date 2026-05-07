// src/hooks/useApi.js
import { useState } from 'react';

export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const backendJson = await apiFunction(...args);
      
      setData(backendJson);
      return backendJson; 

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};