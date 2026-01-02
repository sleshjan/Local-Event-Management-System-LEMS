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

    // Parse Dates (Treat as UTC to preserve exact date/time from backend)
    let dateStr = "Date TBA";
    let timeStr = "";

    // Helper to format in UTC
    // Helper to safely parse date string (handles "YYYY-MM-DD HH:mm:ss" by swapping space to T)
    const parseDateSafe = (dateStr) => {
        if (!dateStr) return null;
        // If format is "2025-12-23 20:45:00", replace space with T to make it ISO-like for consistent parsing
        // But note: "2025-12-23T20:45:00" without Z is treated as Local Time by Date.parse in ES5+, 
        // whereas specific ISO strings might differ. 
        // Given the goal is "Local/Nepal" display and format "2025-12-23 20:45:00", replacing space with T works well for Local time assumption.
        const safeStr = dateStr.replace(' ', 'T');
        const d = new Date(safeStr);
        return isNaN(d) ? null : d;
    };

    let startD = parseDateSafe(event.start_datetime);
    if (startD) {
        dateStr = startD.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        timeStr = startD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (event.date) {
        dateStr = event.date;
        timeStr = event.time || "";
    }

    let endDateStr = "";
    let endTimeStr = "";
    if (event.end_datetime) {
        const endD = parseDateSafe(event.end_datetime);
        if (endD) {
            endDateStr = endD.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            endTimeStr = endD.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
    }


    return {
        ...event, // Keep original fields
        id: event.id || event.event_id,
        slug: event.slug || event.other?.data?.slug || str(event.title || event.name).toLowerCase().replace(/ /g, '-') + '-' + (event.id || event.event_id),
        title: event.name || event.title || event.event_name || "Untitled Event",
        description: event.description || "No description available.",
        date: dateStr,
        time: timeStr,

        endDate: endDateStr,
        endTime: endTimeStr,

        fullStartDate: event.start_datetime,
        fullEndDate: event.end_datetime,

        // Location
        location: event.city || event.location || "Chakupat",
        venue: event.venue || "",
        street: event.street || "",
        coordinates: {
            lat: event.latitude,
            lng: event.longitude
        },
        mapUrl: event.map_url || (event.latitude && event.longitude ? `https://www.google.com/maps?q=${event.latitude},${event.longitude}` : null),

        // Images
        image: event.cover_image || event.image || event.image_url,

        // Categories
        categoryObjects: Array.isArray(event.categories) ? event.categories : [],
        categories: Array.isArray(event.categories)
            ? event.categories.map(c => (typeof c === 'object' ? c.name : c))
            : (typeof event.category === 'string' ? [event.category] : []),

        // Stats & Capacity
        attendees: (event.total_seat != null && event.remaining_seat != null)
            ? (parseInt(event.total_seat, 10) - parseInt(event.remaining_seat, 10))
            : (event.attendees_count || event.attendees || 0),
        maxParticipants: event.total_seat || event.maxParticipants || 0,

        // Price
        price: event.seat_price !== undefined ? parseFloat(event.seat_price) : (event.price !== undefined ? parseFloat(event.price) : 0),

        // Organizer
        organizer: event.organizer || "LEC club",
        organizerBio: event.organizer_bio || event.organizerBio || "LEC club is a designated club for organizing events.",

        duration: event.duration || '',

        // Dynamic Status Calculation
        status: (() => {
            const now = new Date();
            let status = event.status || 'Upcoming'; // Default fallback

            if (event.start_datetime && event.end_datetime) {
                const start = new Date(event.start_datetime);
                const end = new Date(event.end_datetime);

                if (!isNaN(start) && !isNaN(end)) {
                    if (now < start) {
                        status = 'Upcoming';
                    } else if (now >= start && now <= end) {
                        status = 'Active';
                    } else {
                        status = 'Completed';
                    }
                }
            } else if (event.start_datetime) {
                // If only start date, assume active on that day? Or upcoming?
                // Let's stick to simple logic: if started but no end, maybe Active?
                // But usually events have end. Let's rely on backend fallback if invalid dates.
                const start = new Date(event.start_datetime);
                if (now >= start) {
                    // If it started and no end time, maybe it's just 'Active' or 'Completed' depending on duration?
                    // Let's assume Active for a day if no end time? 
                    // For now, let's just say Active if start is passed.
                    status = 'Active';
                }
            }
            return status;
        })()
    };
};
