import apiRequest from './api';

export const eventService = {
  // Get all events
  getAllEvents: async () => {
    return await apiRequest('/event');
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
    return await apiRequest(`/event/${id}`, {
      method: 'PUT',
      body: eventData // apiRequest handles JSON.stringify
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