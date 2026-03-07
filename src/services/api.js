// Base configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const FILE_BASE_URL = '';

/**
 * Get full image URL
 * @param {string} path - The relative or absolute path from the backend
 * @returns {string} - The full URL
 */
export const getImageUrl = (path) => {
  if (!path) return null;

  let cleanPath = path;

  // 1. Handle absolute URLs pointing to our backend
  const backendOrigin = 'https://evkhabars.com';
  if (cleanPath.startsWith(backendOrigin)) {
    // Return absolute URL directly to ensure it works even if local proxy is missing mappings
    // (e.g. /organizers/ path might not be proxied)
    return cleanPath;
  }

  // 2. If it's a non-backend absolute URL (or blob/data), return as is
  if (cleanPath.startsWith('http') || cleanPath.startsWith('blob:') || cleanPath.startsWith('data:')) {
    return cleanPath;
  }

  // 3. Normalize relative path to start with /
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // 4. Remove redundant /api prefix if the backend includes it in the path
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4);
  }

  // 5. Ensure path uses the Laravel storage convention if needed
  const specialPaths = ['/storage', '/profile_images', '/event_cover_img'];
  const isSpecial = specialPaths.some(p => cleanPath.startsWith(p));
  if (!isSpecial) {
    cleanPath = `/storage${cleanPath}`;
  }

  // 6. Construct final URL
  if (!API_BASE_URL.startsWith('http')) {
    // Relative mode (Vite Proxy handles the base)
    return cleanPath;
  }

  // Absolute mode (Production/Vercel)
  try {
    const urlObj = new URL(API_BASE_URL);
    // If API is at .../lems/api, files are at .../lems/storage
    // We extract the base by removing /api from the pathname
    const baseSubPath = urlObj.origin + urlObj.pathname.replace(/\/api\/?$/, '');
    return `${baseSubPath}${cleanPath}`;
  } catch (e) {
    return cleanPath;
  }
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
    'Bypass-Tunnel-Reminder': 'true',
    ...customConfig.headers,
  };

  if (token && !customConfig.skipAuth) {
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

    // Handle Blob responses
    if (config.responseType === 'blob' || customConfig.responseType === 'blob') {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return await response.blob();
    }

    const data = await response.json();

    if (!response.ok) {
      // Log the full error for debugging 500 issues, but skip 422/401 to keep console clean
      if (response.status !== 422 && response.status !== 401) {
        console.error("API Error Response:", {
          status: response.status,
          url: url,
          data: data
        });
      }

      // Create a detailed error object
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      error.errors = data.errors; // For validation errors (Laravel style)
      throw error;
    }

    return data;

  } catch (error) {
    // console.error('API Request Error:', error);
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

  // If we have a structured API error
  if (err.data || err.response?.data) {
    const data = err.data || err.response.data;
    const errors = err.errors || data.errors;

    // 1. Try to extract from 'errors' object (Laravel style)
    if (errors) {
      if (typeof errors === 'string') {
        msg = errors;
      } else if (typeof errors === 'object') {
        // Handle {"errors": {"error": "message"}} or {"errors": {"email": ["message"]}}
        const validations = Object.values(errors).flat();
        if (validations.length > 0 && typeof validations[0] === 'string') {
          msg = validations.join(" ");
        } else if (errors.error && typeof errors.error === 'string') {
          msg = errors.error;
        } else if (data.message) {
          msg = data.message;
        }
      }
    }
    // 2. Try direct 'error' or 'message' keys
    else if (data.error && typeof data.error === 'string') {
      msg = data.error;
    } else if (data.message && typeof data.message === 'string') {
      msg = data.message;
    }
  }
  // 3. Fallback to Error object message
  else if (err.message) {
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
