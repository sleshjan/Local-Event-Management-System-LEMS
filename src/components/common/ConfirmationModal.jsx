import { AlertTriangle, X } from 'lucide-react';
import Button from '../common/Button';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    type = "warning" // warning, info, danger
}) => {
    if (!isOpen) return null;

    const colors = {
        warning: {
            icon: "text-amber-500",
            bg: "bg-amber-100",
            button: "bg-amber-600 hover:bg-amber-700"
        },
        danger: {
            icon: "text-red-500",
            bg: "bg-red-100",
            button: "bg-red-600 hover:bg-red-700"
        },
        info: {
            icon: "text-blue-500",
            bg: "bg-blue-100",
            button: "bg-blue-600 hover:bg-blue-700"
        }
    };

    const style = colors[type];

    // Handle outside click to close
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !loading) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${style.bg}`}>
                            <AlertTriangle className={`h-6 w-6 ${style.icon}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                {title}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                        {/* Close button top right */}
                        {!loading && (
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 transition-colors -mt-1 -mr-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Processing...' : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
