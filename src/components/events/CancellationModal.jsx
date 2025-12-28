import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const CancellationModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState('other');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (reason === 'other' && !note.trim()) {
            setError('Please provide a note for cancellation.');
            return;
        }

        onConfirm({
            cancellation_reason: reason,
            cancellation_note: note
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                    Cancel Registration
                                </h3>
                                <div className="mt-2 text-sm text-gray-500">
                                    <p>Are you sure you want to cancel your registration for this event? This action cannot be undone.</p>
                                </div>

                                <form id="cancellation-form" onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reason for Cancellation
                                        </label>
                                        <select
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        >
                                            <option value="schedule_conflict">Schedule Conflict</option>
                                            <option value="not_interested">Not Interested Anymore</option>
                                            <option value="weather">Weather Conditions</option>
                                            <option value="emergency">Personal Emergency</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Note {reason === 'other' && <span className="text-red-500">*</span>}
                                        </label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                            placeholder="Please consider why you are cancelling..."
                                        />
                                        {error && (
                                            <p className="mt-1 text-sm text-red-600">{error}</p>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <Button
                            text={loading ? "Cancelling..." : "Confirm Cancellation"}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full sm:w-auto sm:ml-3 bg-red-600 hover:bg-red-700 text-white"
                        />
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancellationModal;
