import React, { useState } from 'react';

const RegistrationModal = ({ isOpen, onClose, onConfirm, event, loading }) => {
    const [seats, setSeats] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    if (!isOpen || !event) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            event_id: event.id,
            seats_booked: parseInt(seats),
            payment_method: paymentMethod
        });
    };

    return (
        // Simple, robust centering overlay with glass effect
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl transform transition-all">
                <h2 className="text-xl font-bold mb-4">Register for {event.title}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Seats Field */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Seats Booked</label>
                        <input
                            type="number"
                            min="1"
                            value={seats}
                            onChange={(e) => setSeats(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>

                    {/* Payment Method Field */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="cash">Cash</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationModal;
