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
  registerForEvent: async (eventId) => {
    return await apiRequest(`/event/${eventId}/register`, {
      method: 'POST'
    });
  }
};