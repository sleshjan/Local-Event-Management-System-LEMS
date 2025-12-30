import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from "../../components/admin/AdminSidebar";
import { normalizeEventData } from '../../utils/eventUtils';
import { eventService } from "../../services/eventService";
import SearchInput from "../../components/common/SearchInput";
import UserProfileIcon from "../../components/common/UserProfileIcon";
import RegistrationDetailsModal from "../../components/admin/RegistrationDetailsModal";
import { Menu, X, Eye } from "lucide-react";

const ManageRegistrations = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch All Registrations
                const response = await eventService.getAllRegistrations();
                let regsData = [];

                if (Array.isArray(response)) {
                    regsData = response;
                } else if (response?.data && Array.isArray(response.data)) {
                    regsData = response.data;
                } else if (response?.data?.data && Array.isArray(response.data.data)) {
                    regsData = response.data.data;
                }

                // Prepare data for table
                // We map it to include user info and event info
                const formattedRegs = await Promise.all(regsData.map(async (reg) => {
                    let ev = reg.event;

                    // Fallback: fetch event if missing (robustness)
                    if (!ev && reg.event_id) {
                        try {
                            const detailResponse = await eventService.getEvent(reg.event_id);
                            ev = detailResponse.data || detailResponse;
                        } catch (e) {
                            ev = {};
                        }
                    }
                    ev = ev || {};
                    const normEvent = normalizeEventData(ev);

                    // User data is likely in reg.user or similar if expected by admin
                    // Adjust based on actual API response structure for 'user'
                    const user = reg.user || { name: 'Unknown User', email: 'N/A' };

                    return {
                        id: reg.id,
                        user: user,
                        event: {
                            id: ev.id,
                            title: ev.name || ev.title || "Untitled Event",
                            date: normEvent?.date || ev.date || "Date TBA",
                            location: ev.location || ev.venue || "TBA",
                            slug: ev.slug
                        },
                        status: reg.status || 'Registered',
                        paymentStatus: reg.payment_status || 'Pending',
                        paymentMethod: reg.payment_method || 'Cash',
                        seatsBooked: reg.seats_booked || 1,
                        amount: (ev.seat_price || ev.price || 0) * (reg.seats_booked || 1),
                        registeredAt: reg.created_at || reg.registered_at,
                        cancellationReason: reg.cancellation_reason,
                        cancellationNote: reg.cancellation_note
                    };
                }));

                setRegistrations(formattedRegs);
            } catch (err) {
                console.error("Failed to load registrations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleViewDetails = async (regId) => {
        try {
            const response = await eventService.getRegistration(regId);
            const regData = response.data || response; // content might be directly returned or in data

            // Normalize the fetched single registration data similarly to list
            // Note: The API likely returns just the registration object including relations
            let ev = regData.event || {};
            const normEvent = normalizeEventData(ev);
            const user = regData.user || { name: 'Unknown User', email: 'N/A' };

            const formattedDetail = {
                id: regData.id,
                user: user,
                event: {
                    id: ev.id,
                    title: ev.name || ev.title || "Untitled Event",
                    date: normEvent?.date || ev.date || "Date TBA",
                    location: ev.location || ev.venue || "TBA",
                },
                status: regData.status || 'Registered',
                paymentStatus: regData.payment_status || 'Pending',
                paymentMethod: regData.payment_method || 'Cash',
                seatsBooked: regData.seats_booked || 1,
                amount: (ev.seat_price || ev.price || 0) * (regData.seats_booked || 1),
                registeredAt: regData.created_at || regData.registered_at,
                cancellationReason: regData.cancellation_reason,
                cancellationNote: regData.cancellation_note
            };

            setSelectedRegistration(formattedDetail);
            setIsDetailsOpen(true);
        } catch (error) {
            console.error("Failed to fetch registration details", error);
            alert("Failed to load registration details.");
        }
    };

    // Filter based on search
    const filteredRegs = registrations.filter(reg =>
        reg.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.event?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.id.toString().includes(searchQuery)
    );

    const getStatusBadge = (status) => {
        const styles = {
            'registered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'pending': 'bg-yellow-100 text-yellow-800'
        };
        const s = (status || '').toLowerCase();
        return (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[s] || 'bg-gray-100 text-gray-800'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
                    <div className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col">
                        <div className="p-4 flex justify-end border-b border-gray-200">
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <AdminSidebar />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 whitespace-nowrap">Registrations</h1>

                            {/* Search */}
                            <div className="max-w-md w-full ml-4 hidden sm:block">
                                <SearchInput
                                    placeholder="Search by user, event or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <UserProfileIcon />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">Loading registrations...</div>
                        ) : (
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seats</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredRegs.map((reg) => (
                                                <tr key={reg.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{reg.id}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">{reg.user?.name}</span>
                                                            <span className="text-xs text-gray-500">{reg.user?.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-gray-900">{reg.event.title}</span>
                                                            <span className="text-xs text-gray-500">{reg.event.date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(reg.status)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                            {reg.paymentStatus}
                                                        </span>
                                                        <span className="ml-2 text-xs text-gray-400 capitalize">({reg.paymentMethod})</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{reg.seatsBooked}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleViewDetails(reg.id)}
                                                            className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded-full transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredRegs.length === 0 && (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No registrations found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <RegistrationDetailsModal
                    isOpen={isDetailsOpen}
                    onClose={() => setIsDetailsOpen(false)}
                    registration={selectedRegistration}
                />
            </div>
        </div>
    );
};

export default ManageRegistrations;
