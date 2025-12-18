// Base configuration
export const API_BASE_URL = '/api';
export const FILE_BASE_URL = '';

/**
 * Get full image URL
 * @param {string} path - The relative path from the backend
 * @returns {string} - The full URL
 */
export const getImageUrl = (path) => {
  if (!path) return null;

  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }

  // Handle Laravel storage folder convention
  let cleanPath = path;

  // Check for specific root folders that shouldn't get /storage prefix
  if (cleanPath.startsWith('profile_images') || cleanPath.startsWith('/profile_images') ||
    cleanPath.startsWith('event_cover_img') || cleanPath.startsWith('/event_cover_img')) {
    if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }
    return cleanPath;
  }

  if (!cleanPath.startsWith('/') && !cleanPath.startsWith('storage')) {
    cleanPath = `/storage/${cleanPath}`;
  } else if (cleanPath.startsWith('/') && !cleanPath.startsWith('/storage')) {
    cleanPath = `/storage${cleanPath}`;
  } else if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  return cleanPath;
};

/**
 * Generic API request handler
 * @param {string} endpoint - The API endpoint (e.g., '/login')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - The response data
 */
const apiRequest = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...customConfig.headers,
  };

  if (token) {
    // Token attached
    headers.Authorization = `Bearer ${token}`;
  } else {
    // Silent fail or debug log only
  }

  const config = {
    method: 'GET', // Default method
    ...customConfig,
    headers,
  };

  let url = `${API_BASE_URL}${endpoint}`;

  if (body) {
    if (config.method.toUpperCase() === 'GET') {
      const queryString = new URLSearchParams(body).toString();
      url += (url.includes('?') ? '&' : '?') + queryString;
    } else if (body instanceof FormData) {
      config.body = body;
      delete headers['Content-Type']; // Let browser set content-type with boundary
    } else {
      config.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      // Create a detailed error object
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.errors = data.errors; // For validation errors (Laravel style)
      throw error;
    }

    return data;

  } catch (error) {
    throw error;
  }
};

/**
 * Helper to parse API errors into user-friendly messages
 * @param {Error} err - The error object thrown by apiRequest
 * @returns {string} - User-friendly error message
 */
export const parseApiError = (err) => {
  let msg = "An unexpected error occurred. Please try again.";

  if (err.response || err.data) {
    // If it's a validation error (422)
    if (err.status === 422 || (err.response && err.response.status === 422)) {
      const errors = err.errors || (err.data && err.data.errors) || (err.response && err.response.data && err.response.data.errors);
      if (errors) {
        // Flatten errors: { email: ["bad"], password: ["bad"] } -> "bad bad"
        const validations = Object.values(errors).flat();
        if (validations.length > 0) {
          msg = validations.join(" ");
        } else {
          msg = "Please check your input fields.";
        }
      } else {
        msg = err.message || (err.data && err.data.message) || "Validation failed.";
      }
    } else {
      // Other API errors
      msg = err.message || (err.data && err.data.message) || msg;
    }
  } else if (err.message) {
    msg = err.message;
  }

  // Sanitize: Remove technical codes or "HTTP error" text if possible, though backend msg might be used
  // Remove "422" or "500" if they appear in the text
  msg = msg.replace(/\b\d{3}\b/g, "").replace(/HTTP error!/gi, "").trim();

  // Capitalize first letter
  if (msg.length > 0) {
    msg = msg.charAt(0).toUpperCase() + msg.slice(1);
  }

  return msg || "Something went wrong.";
};

export default apiRequest;