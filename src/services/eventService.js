import apiRequest from './api';

export const eventService = {
  // Get all events
  getAllEvents: async () => {
    return await apiRequest('/events');
  },

  // Get single event
  getEvent: async (id) => {
    return await apiRequest(`/events/${id}`);
  },

  // Create event (admin)
  createEvent: async (eventData) => {
    return await apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  // Update event (admin)
  updateEvent: async (id, eventData) => {
    return await apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  // Delete event (admin)
  deleteEvent: async (id) => {
    return await apiRequest(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  // Register for event (user)
  registerForEvent: async (eventId) => {
    return await apiRequest(`/events/${eventId}/register`, {
      method: 'POST'
    });
  }
};