export const normalizeEventData = (event) => {
    if (!event) return null;

    return {
        ...event,
        id: event.id,
        title: event.name || event.title || "Untitled Event",
        date: event.date || "Date TBA",
        location: event.location || event.venue || "Location TBA",
        image: event.image || event.image_url || event.cover_image,
        // Normalize categories to simple string array
        categories: Array.isArray(event.categories)
            ? event.categories.map(c => (typeof c === 'object' ? c.name : c))
            : (typeof event.category === 'string' ? [event.category] : []),
        attendees: event.attendees_count || event.attendees || 0,
        price: event.price !== undefined ? event.price : 'TBA',
        description: event.description || '',
        organizer: event.organizer || '',
        organizerBio: event.organizerBio || '',
        maxParticipants: event.maxParticipants || 0,
        time: event.time || ''
    };
};
