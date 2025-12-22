export const normalizeEventData = (data) => {
    if (!data) return null;

    // Handle nested structure locally if passed raw response
    let event = data;
    if (data.other && data.other.data) {
        event = data.other.data;
    } else if (data.data?.other?.data) {
        event = data.data.other.data;
    } else if (data.data) {
        // sometimes it's just data.data
        event = data.data;
    }

    // If it turned out to be an array (from a list response), take the first item if checking details
    if (Array.isArray(event)) {
        event = event[0];
    }

    if (!event) return null;

    // Helper to safety check strings
    const str = (val) => (val || '').toString();

    // Parse Dates
    let dateStr = "Date TBA";
    let timeStr = "";

    if (event.start_datetime) {
        const d = new Date(event.start_datetime);
        if (!isNaN(d)) {
            dateStr = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    } else if (event.date) {
        dateStr = event.date;
        timeStr = event.time || "";
    }

    return {
        ...event, // Keep original fields
        id: event.id,
        slug: event.slug || event.other?.data?.slug || str(event.title || event.name).toLowerCase().replace(/ /g, '-') + '-' + event.id,
        title: event.name || event.title || event.event_name || "Untitled Event",
        description: event.description || "No description available.",
        date: dateStr,
        time: timeStr,
        fullStartDate: event.start_datetime,
        fullEndDate: event.end_datetime,

        // Location
        location: event.city || event.location || "Location TBA",
        venue: event.venue || "",
        street: event.street || "",
        coordinates: {
            lat: event.latitude,
            lng: event.longitude
        },

        // Images
        image: event.cover_image || event.image || event.image_url,

        // Categories
        categoryObjects: Array.isArray(event.categories) ? event.categories : [],
        categories: Array.isArray(event.categories)
            ? event.categories.map(c => (typeof c === 'object' ? c.name : c))
            : (typeof event.category === 'string' ? [event.category] : []),

        // Stats & Capacity
        attendees: event.attendees_count || event.attendees || 0,
        maxParticipants: event.total_seat || event.maxParticipants || 0,

        // Price
        price: event.seat_price !== undefined ? parseFloat(event.seat_price) : (event.price !== undefined ? parseFloat(event.price) : 0),

        // Organizer
        organizer: event.organizer || "Unknown Organizer",
        organizerBio: event.organizer_bio || event.organizerBio || "",

        duration: event.duration || ''
    };
};
