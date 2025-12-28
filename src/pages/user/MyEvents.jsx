import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/common/Sidebar";
import EventCard from "../../components/events/EventCard";
import CancellationModal from "../../components/events/CancellationModal";
import { Menu, X, Plus } from "lucide-react";
import { userService } from "../../services/userService";
import { eventService } from "../../services/eventService";
import { parseApiError } from "../../services/api";
import UserProfileIcon from "../../components/common/UserProfileIcon";

const MyEvents = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Cancellation State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [cancellationLoading, setCancellationLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userProfile = await userService.getProfile();
                setUser(userProfile);

                const response = await eventService.getAllEvents();

                let eventsData = [];

                // Priority 1: Standard API/Laravel paths
                if (Array.isArray(response)) {
                    eventsData = response;
                } else if (response?.data && Array.isArray(response.data)) {
                    eventsData = response.data;
                } else if (response?.data?.data && Array.isArray(response.data.data)) {
                    eventsData = response.data.data;
                }
                // Priority 2: User specified path
                else if (response?.data?.other?.data && Array.isArray(response.data.other.data)) {
                    eventsData = response.data.other.data;
                }
                else if (response?.other?.data && Array.isArray(response.other.data)) {
                    eventsData = response.other.data;
                }

                // Fallback: Recursive helper to find any array of objects that look like events
                if (eventsData.length === 0) {
                    const findEventsInObject = (obj, depth = 0) => {
                        if (!obj || depth > 5) return null; // Avoid circular/too deep

                        // If this object itself is an array of events
                        if (Array.isArray(obj)) {
                            if (obj.length === 0) return obj; // Empty array might be it
                            // Check if first item looks like an event (has ID or title/name)
                            const first = obj[0];
                            if (first && typeof first === 'object' && (first.id !== undefined || first.title || first.name || first.event_name)) {
                                return obj;
                            }
                            return null;
                        }

                        if (typeof obj === 'object') {
                            // 1. Check common keys first for efficiency
                            const commonKeys = ['data', 'events', 'results', 'payload'];
                            for (const key of commonKeys) {
                                if (obj[key]) {
                                    const found = findEventsInObject(obj[key], depth + 1);
                                    if (found) return found;
                                }
                            }

                            // 2. Check all other keys
                            for (const key in obj) {
                                if (!commonKeys.includes(key) && Object.prototype.hasOwnProperty.call(obj, key)) {
                                    const found = findEventsInObject(obj[key], depth + 1);
                                    if (found) return found;
                                }
                            }

                            // 3. Fallback: Treat object values as a list (associative array case)
                            const values = Object.values(obj);
                            const meaningfulObjects = values.filter(v =>
                                v && typeof v === 'object' && (v.id !== undefined || v.title || v.name)
                            );
                            if (meaningfulObjects.length > 0 && meaningfulObjects.length > 2) {
                                return meaningfulObjects;
                            }
                        }

                        return null;
                    };

                    const found = findEventsInObject(response);
                    if (found) eventsData = found;
                }

                const formattedEvents = eventsData.map(ev => ({
                    ...ev,
                    id: ev.id,
                    title: ev.name || ev.title || "Untitled Event",
                    date: ev.date || "Date TBA",
                    location: ev.location || ev.venue || "Location TBA",
                    image: ev.image || ev.image_url || ev.cover_image,
                    status: ev.status || "Upcoming", // Default to Upcoming if missing
                    categories: Array.isArray(ev.categories)
                        ? ev.categories.map(c => (typeof c === 'object' ? c.name : c))
                        : (typeof ev.category === 'string' ? [ev.category] : []),
                    attendees: ev.attendees_count || ev.attendees || 0
                }));

                setEvents(formattedEvents);
            } catch (err) {
                console.error("Failed to load events:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCancelClick = (eventId) => {
        setSelectedEventId(eventId);
        setShowCancelModal(true);
    };

    const handleConfirmCancellation = async (data) => {
        if (!selectedEventId) return;

        setCancellationLoading(true);
        try {
            await eventService.cancelRegistration(selectedEventId, data);
            alert("Registration cancelled successfully.");

            // Remove the cancelled event from the list
            setEvents(prevEvents => prevEvents.filter(e => e.id !== selectedEventId));
            setShowCancelModal(false);
            setSelectedEventId(null);
        } catch (error) {
            alert(parseApiError(error));
        } finally {
            setCancellationLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar userInterests={user?.interests || []} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                    <div className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col">
                        <div className="p-4 flex justify-end border-b border-gray-200">
                            <button
                                onClick={() => setIsSidebarOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <Sidebar userInterests={user?.interests || []} />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Events</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {user?.role === 'organizer' && (
                                <button
                                    onClick={() => navigate('/user/create-event')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors shadow-sm hover:shadow-md transform hover:scale-105"
                                >
                                    <Plus className="w-5 h-5" /> Create Event
                                </button>
                            )}
                            <UserProfileIcon />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading events...</div>
                        ) : events.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event, index) => (
                                    <div key={event.id || index} className="flex flex-col h-full relative group">
                                        <EventCard event={event} role='user' />

                                        {/* Cancellation Button for Upcoming Events */}
                                        {event.status === 'Upcoming' && (
                                            <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent card click
                                                        handleCancelClick(event.id);
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-md transition-transform transform hover:scale-105"
                                                >
                                                    Cancel Registration
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No events found.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <CancellationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleConfirmCancellation}
                loading={cancellationLoading}
            />
        </div>
    );
};

export default MyEvents;
