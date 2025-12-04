// Base configuration
const API_BASE_URL = 'https://lems.loca.lt/api';

// Helper function for requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'bypass-tunnel-reminder': 'true',
      ...options.headers,
    }
  };
  
  // Add token if it exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

export default apiRequest;