import apiRequest from './api';

export const eventService = {
  // Get all events
  getAllEvents: async () => {
    return await apiRequest('/event', { skipAuth: true });
  },

  // Get single event
  getEvent: async (id) => {
    return await apiRequest(`/event/${id}`);
  },

  // Create event (admin)
  createEvent: async (eventData) => {
    return await apiRequest('/event', {
      method: 'POST',
      body: eventData // apiRequest handles JSON.stringify
    });
  },

  // Update event (admin)
  updateEvent: async (id, eventData) => {
    const isFormData = eventData instanceof FormData;
    return await apiRequest(`/event/${id}`, {
      method: isFormData ? 'POST' : 'PUT',
      body: eventData
    });
  },

  // Delete event (admin)
  deleteEvent: async (id) => {
    return await apiRequest(`/event/${id}`, {
      method: 'DELETE'
    });
  },

  // Register for event (user)
  registerForEvent: async (data) => {
    return await apiRequest(`/event-registration`, {
      method: 'POST',
      body: data
    });
  },

  // Cancel event registration (user)
  cancelRegistration: async (id, data) => {
    return await apiRequest(`/event-registration/${id}/cancel`, {
      method: 'POST',
      body: data
    });
  },

  // Cancel event (admin)
  cancelEvent: async (id) => {
    return await apiRequest(`/event/${id}/cancel`, {
      method: 'POST'
    });
  },

  // Get user's registrations
  getMyRegistrations: async () => {
    return await apiRequest('/event-registration/my');
  },

  // Get all registrations (admin)
  getAllRegistrations: async () => {
    return await apiRequest('/event-registration');
  },

  // Get single registration (admin)
  getRegistration: async (id) => {
    return await apiRequest(`/event-registration/${id}`);
  },

  // Generate Ticket (user)
  generateTicket: async (id) => {
    return await apiRequest(`/event-registration/${id}/ticket`, { responseType: 'blob' });
  },

  // Upload event images (user feedback)
  uploadEventImages: async (eventId, images) => {
    const formData = new FormData();

    // Validate and append images
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const maxSize = 2048 * 1024; // 2048 KB in bytes

      if (image.size > maxSize) {
        throw new Error(`Image "${image.name}" exceeds 2 MB limit (${(image.size / 1024 / 1024).toFixed(2)} MB)`);
      }

      formData.append('images[]', image);
    }

    return await apiRequest(`/event/${eventId}/upload-images`, {
      method: 'POST',
      body: formData
    });
  },

  // Get events by category
  getEventsByCategory: async (slug) => {
    const response = await apiRequest(`/event/category/${slug}`);
    // Extract data from pagination structure if present
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback if structure changes or is distinct
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return response;
  },

  // Get events by price range
  getEventsByPrice: async (min, max) => {
    const response = await apiRequest(`/event/price/${min}-${max}`);
    // Extract data from pagination structure if present
    if (response?.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback if structure changes or is distinct
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    return response;
  },

  // Submit event feedback (user)
  submitEventFeedback: async (eventId, comment) => {
    return await apiRequest(`/event/${eventId}/feedback`, {
      method: 'POST',
      body: { comment }
    });
  },

  // Get nearby events (filter)
  getNearbyEvents: async ({ latitude, longitude, radius }) => {
    const query = new URLSearchParams({ latitude, longitude, radius }).toString();
    return await apiRequest(`/event?${query}`);
  },
};