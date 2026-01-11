import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/common/Sidebar";
import CancellationModal from "../../components/events/CancellationModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import { Menu, X, Download, Eye, AlertCircle } from "lucide-react";
import { normalizeEventData } from '../../utils/eventUtils';
import { userService } from "../../services/userService";
import { eventService } from "../../services/eventService";
import { parseApiError } from "../../services/api";
import UserProfileIcon from "../../components/common/UserProfileIcon";
import { useToast } from '../../context/ToastContext';

const MyEvents = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { showToast } = useToast();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    // Cancellation State
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [cancellationLoading, setCancellationLoading] = useState(false);

    // Ticket Confirmation State
    const [showTicketConfirmModal, setShowTicketConfirmModal] = useState(false);
    const [pendingTicketAction, setPendingTicketAction] = useState(null); // { type: 'view' | 'download', regId: number }

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

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
                    const status = normEvent.status;

                    // Check if ticket is viewed/downloaded.
                    // Backend might not send this explicitly yet, so we rely on what we have + local interactions for now
                    // If reg.ticket_generated or similar field existed, use it.
                    // Assuming reg.ticket_viewed or similiar. For now using ticketGenerated from data if avail.
                    const isTicketAccessed = reg.is_ticket_generated || reg.ticket_generated || reg.ticket_viewed || localStorage.getItem(`ticket_accessed_${reg.id}`) === 'true' || false;

                    return {
                        // Registration Details
                        registrationId: reg.id,
                        paymentStatus: reg.payment_status || 'Pending',
                        paymentMethod: reg.payment_method || 'Cash',
                        seatsBooked: reg.seats_booked || 1,
                        ticketGenerated: isTicketAccessed,

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

    const processTicketAction = async (type, regId) => {
        try {
            const blob = await eventService.generateTicket(regId);
            const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));

            if (type === 'view') {
                window.open(url, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = url;
                link.download = `ticket-${regId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }

            // Mark as accessed locally to disable cancellation immediately
            // Persist to localStorage since backend might not save it immediately
            localStorage.setItem(`ticket_accessed_${regId}`, 'true');
            setEvents(prev => prev.map(ev =>
                ev.registrationId === regId ? { ...ev, ticketGenerated: true } : ev
            ));

        } catch (error) {
            console.error(`${type} ticket failed:`, error);
            showToast(`Failed to ${type} ticket. ` + (error.message || "Please try again."), "error");
        }
    };

    const handleTicketClick = (type, regId) => {
        const event = events.find(e => e.registrationId === regId);
        if (!event) return;

        // If ticket already recognized as generated/viewed, or if we want to confirm every time?
        // User asked: "once the ticket's been viewed or downloaded, it cant then the event cant be cancelled"
        // So checking if it *has not* been generated yet to show the warning.
        // If it *has* been generated, cancellation is already disabled, so no need to warn about disabling it again.
        // However, if logic is exclusively frontend for now, we should check `ticketGenerated`

        if (event.ticketGenerated) {
            // Already accessed, just open/download directly
            processTicketAction(type, regId);
        } else {
            // First time access, show warning
            setPendingTicketAction({ type, regId });
            setShowTicketConfirmModal(true);
        }
    };

    const handleConfirmTicketAction = () => {
        if (pendingTicketAction) {
            processTicketAction(pendingTicketAction.type, pendingTicketAction.regId);
            setShowTicketConfirmModal(false);
            setPendingTicketAction(null);
        }
    };

    const handleViewTicket = (regId) => handleTicketClick('view', regId);
    const handleDownloadTicket = (regId) => handleTicketClick('download', regId);

    const handleCancelClick = (regId) => {
        const event = events.find(e => e.registrationId === regId);
        if (!event) return;

        if (event.ticketGenerated) {
            showToast("Cannot cancel booking. Ticket has already been accessed.", "error");
            return;
        }

        setSelectedEventId(regId);
        setShowCancelModal(true);
    };

    const handleConfirmCancellation = async (data) => {
        if (!selectedEventId) return;

        setCancellationLoading(true);
        try {
            await eventService.cancelRegistration(selectedEventId, data);
            showToast("Registration cancelled successfully.", "success");

            // Remove the cancelled event from the list (using registrationId)
            setEvents(prevEvents => prevEvents.filter(e => e.registrationId !== selectedEventId));
            setShowCancelModal(false);
            setSelectedEventId(null);
        } catch (error) {
            showToast(parseApiError(error), "error");
        } finally {
            setCancellationLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Upcoming': 'bg-blue-100 text-blue-800',
            'Ongoing': 'bg-green-100 text-green-800',
            'Active': 'bg-green-100 text-green-800', // Keep for compatibility if any old data exists
            'Completed': 'bg-gray-200 text-gray-800',
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
                                                                    disabled={event.ticketGenerated}
                                                                    className={`text-red-600 hover:text-red-900 ${event.ticketGenerated ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                                                                <Download className={`w-5 h-5 ${event.ticketGenerated ? '' : 'animate-pulse'}`} />
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

            <ConfirmationModal
                isOpen={showTicketConfirmModal}
                onClose={() => setShowTicketConfirmModal(false)}
                onConfirm={handleConfirmTicketAction}
                title="Access Ticket?"
                message="Attention: Viewing or downloading this ticket will confirm your attendance. Once accessed, you will NO LONGER be able to cancel this booking. Do you wish to proceed?"
                confirmText="Yes, Access Ticket"
                cancelText="Not Yet"
                type="warning"
            />
        </div>
    );
};

export default MyEvents;
