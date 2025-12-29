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
};