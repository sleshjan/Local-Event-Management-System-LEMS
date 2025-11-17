// Get all view counts from localStorage
export const getViewCounts = () => {
  const viewCounts = localStorage.getItem('eventViewCounts');
  return viewCounts ? JSON.parse(viewCounts) : {};
};

// Get view count for a specific event
export const getEventViewCount = (eventId) => {
  const viewCounts = getViewCounts();
  return viewCounts[eventId] || 0;
};

// Increment view count for an event
export const incrementViewCount = (eventId) => {
  const viewCounts = getViewCounts();
  viewCounts[eventId] = (viewCounts[eventId] || 0) + 1;
  localStorage.setItem('eventViewCounts', JSON.stringify(viewCounts));
  return viewCounts[eventId];
};

// Check if current user has viewed this event
export const hasUserViewedEvent = (eventId, userId = 'current-user') => {
  const viewedEvents = JSON.parse(localStorage.getItem('viewedEvents') || '{}');
  return viewedEvents[userId]?.includes(eventId) || false;
};

// Mark event as viewed by current user
export const markEventAsViewed = (eventId, userId = 'current-user') => {
  const viewedEvents = JSON.parse(localStorage.getItem('viewedEvents') || '{}');
  
  if (!viewedEvents[userId]) {
    viewedEvents[userId] = [];
  }
  
  if (!viewedEvents[userId].includes(eventId)) {
    viewedEvents[userId].push(eventId);
    localStorage.setItem('viewedEvents', JSON.stringify(viewedEvents));
    return true; // View was new
  }
  
  return false; // Already viewed
};