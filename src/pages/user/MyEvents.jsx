import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/common/Sidebar";
import CancellationModal from "../../components/events/CancellationModal";
import { Menu, X, Download, Eye } from "lucide-react";
import { normalizeEventData } from '../../utils/eventUtils';
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

                // Fetch Registrations
                const response = await eventService.getMyRegistrations();
                let registrations = [];

                if (Array.isArray(response)) {
                    registrations = response;
                } else if (response?.data && Array.isArray(response.data)) {
                    // Check if it's a direct array under data
                    registrations = response.data;
                } else if (response?.data?.data && Array.isArray(response.data.data)) {
                    // Handle Laravel pagination structure: response.data.data
                    registrations = response.data.data;
                }

                // Filter out cancelled registrations
                registrations = registrations.filter(reg => reg.status !== 'cancelled');

                // Map registrations to flat structure for table
                // Using Promise.all to handle potential async fetching if event data is missing
                const formattedEvents = await Promise.all(registrations.map(async (reg) => {
                    let ev = reg.event;

                    // Fallback: If event details are missing but we have an ID, fetch it
                    if (!ev && reg.event_id) {
                        try {
                            const detailResponse = await eventService.getEvent(reg.event_id);
                            ev = detailResponse.data || detailResponse;
                        } catch (e) {
                            console.warn(`Failed to fetch event details for registration ${reg.id}`, e);
                            ev = {};
                        }
                    }

                    ev = ev || {};
                    const normEvent = normalizeEventData(ev);

                    // Normalize status to Title Case for consistency (upcoming -> Upcoming)
                    const rawStatus = ev.status || "upcoming";
                    const status = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

                    return {
                        // Registration Details
                        registrationId: reg.id,
                        paymentStatus: reg.payment_status || 'Pending',
                        paymentMethod: reg.payment_method || 'Cash',
                        seatsBooked: reg.seats_booked || 1,
                        ticketGenerated: reg.ticket_generated || false,

                        // Event Details
                        id: ev.id,
                        title: ev.name || ev.title || "Untitled Event",
                        slug: ev.slug,
                        date: normEvent?.date || ev.date || "Date TBA",
                        time: normEvent?.time || ev.time || "",
                        location: ev.location || ev.venue || "Location TBA",
                        status: status,
                        price: ev.seat_price || ev.price || 0,
                    };
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

    const handleViewTicket = async (regId) => {
        try {
            const blob = await eventService.generateTicket(regId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            window.open(url, '_blank');

            // Optional: Mark as generated if we want to show it's been accessed, 
            // but we won't disable the button.
            setEvents(prev => prev.map(ev =>
                ev.registrationId === regId ? { ...ev, ticketGenerated: true } : ev
            ));
        } catch (error) {
            console.error("View ticket failed:", error);
            alert("Failed to view ticket. " + (error.message || "Please try again."));
        }
    };

    const handleDownloadTicket = async (regId) => {
        try {
            const blob = await eventService.generateTicket(regId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `ticket-${regId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download ticket failed:", error);
            alert("Failed to download ticket. " + (error.message || "Please try again."));
        }
    };

    const handleCancelClick = (regId) => {
        setSelectedEventId(regId);
        setShowCancelModal(true);
    };

    const handleConfirmCancellation = async (data) => {
        if (!selectedEventId) return;

        setCancellationLoading(true);
        try {
            await eventService.cancelRegistration(selectedEventId, data);
            alert("Registration cancelled successfully.");

            // Remove the cancelled event from the list (using registrationId)
            setEvents(prevEvents => prevEvents.filter(e => e.registrationId !== selectedEventId));
            setShowCancelModal(false);
            setSelectedEventId(null);
        } catch (error) {
            alert(parseApiError(error));
        } finally {
            setCancellationLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Upcoming': 'bg-blue-100 text-blue-800',
            'Active': 'bg-green-100 text-green-800',
            'Past': 'bg-gray-100 text-gray-800',
            'Completed': 'bg-gray-100 text-gray-800',
            'Cancelled': 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const styles = {
            'paid': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'failed': 'bg-red-100 text-red-800',
            'refunded': 'bg-purple-100 text-purple-800'
        };
        // normalizing status to lowercase just in case
        const s = (status || 'pending').toLowerCase();
        return (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[s] || styles['pending']}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        );
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
                            <UserProfileIcon />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading events...</div>
                        ) : events.length > 0 ? (
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Event
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Payment
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Seats
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ticket
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {events.map((event) => (
                                                <tr key={event.registrationId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">{event.title}</span>
                                                            <span className="text-xs text-gray-500">{event.date} {event.time && `• ${event.time}`}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStatusBadge(event.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col gap-1">
                                                            {getPaymentBadge(event.paymentStatus)}
                                                            <span className="text-xs text-gray-400 capitalize">{event.paymentMethod}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {event.seatsBooked}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        Rs. {event.price * event.seatsBooked}
                                                    </td>
                                                    <td className="px-5 py-5 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-evenly gap-3">
                                                            <button
                                                                onClick={() => navigate(`/event/${event.slug || event.id}`, { state: { event: event } })}
                                                                className="text-purple-600 hover:text-purple-900"
                                                            >
                                                                View
                                                            </button>
                                                            {event.status === 'Upcoming' && (
                                                                <button
                                                                    onClick={() => handleCancelClick(event.registrationId)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleViewTicket(event.registrationId)}
                                                                disabled={event.status === 'Cancelled'}
                                                                title="View Ticket"
                                                                className={`p-2 rounded-full transition-colors ${event.status === 'Cancelled'
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-indigo-600 hover:bg-indigo-50'
                                                                    }`}
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadTicket(event.registrationId)}
                                                                disabled={event.status === 'Cancelled'}
                                                                title="Download Ticket"
                                                                className={`p-2 rounded-full transition-colors ${event.status === 'Cancelled'
                                                                    ? 'text-gray-300 cursor-not-allowed'
                                                                    : 'text-green-600 hover:bg-green-50'
                                                                    }`}
                                                            >
                                                                <Download className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No registered events found.
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
