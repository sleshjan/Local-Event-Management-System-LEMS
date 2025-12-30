import { X, Calendar, MapPin, User, CreditCard, Info } from 'lucide-react';

const RegistrationDetailsModal = ({ isOpen, onClose, registration }) => {
    if (!isOpen || !registration) return null;

    const { user, event, status, paymentStatus, paymentMethod, seatsBooked, amount, cancellationReason, cancellationNote, registeredAt } = registration;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-900">Registration Details #{registration.id}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status Section */}
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Status</p>
                            {getStatusBadge(status)}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">Registered At</p>
                            <p className="font-medium text-gray-900">{new Date(registeredAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Details */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-semibold text-gray-900 border-b pb-2">
                                <User className="w-5 h-5 text-purple-600" /> User Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{user?.name}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium">{user?.email}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium">{user?.phone || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Address:</span> <span className="font-medium text-right max-w-[60%]">{user?.address || 'N/A'}</span></div>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-semibold text-gray-900 border-b pb-2">
                                <Calendar className="w-5 h-5 text-purple-600" /> Event Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-500">Title:</span> <span className="font-medium text-right">{event?.title}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Date:</span> <span className="font-medium">{event?.date}</span></div>
                                <div className="flex justify-between"><span className="text-gray-500">Location:</span> <span className="font-medium text-right">{event?.location || 'TBA'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Seats */}
                    <div className="space-y-4">
                        <h4 className="flex items-center gap-2 font-semibold text-gray-900 border-b pb-2">
                            <CreditCard className="w-5 h-5 text-purple-600" /> Payment & Seats
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Seats Booked</p>
                                <p className="font-bold text-lg text-gray-900">{seatsBooked}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                <p className="font-medium text-gray-900 capitalize">{paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {paymentStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Info (if cancelled) */}
                    {(status === 'cancelled' || cancellationReason) && (
                        <div className="space-y-4">
                            <h4 className="flex items-center gap-2 font-semibold text-red-700 border-b border-red-100 pb-2">
                                <Info className="w-5 h-5 text-red-600" /> Cancellation Details
                            </h4>
                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-sm space-y-2">
                                <div className="flex justify-between"><span className="text-red-600 font-medium">Reason:</span> <span className="text-gray-900 capitalize">{cancellationReason || 'N/A'}</span></div>
                                <div>
                                    <span className="text-red-600 font-medium block mb-1">Note:</span>
                                    <p className="text-gray-700 bg-white p-2 rounded border border-red-100">{cancellationNote || 'No note provided.'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                        type="button"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegistrationDetailsModal;
