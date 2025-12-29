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
            setError('Please pro-de a note for cancellation.');
            return;
        }

        onConfirm({
            cancellation_reason: reason,
            cancellation_note: note
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                Cancel Registration
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Are you sure? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reason for Cancellation
                            </label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                            >
                                <option value="schedule_conflict">Schedule Conflict</option>
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
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none"
                                placeholder="Why are you cancelling?"
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Keep Registration
                            </button>
                            <Button
                                text={loading ? "Cancelling..." : "Confirm Cancel"}
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-3"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CancellationModal;
