import { useState, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { X, AlertCircle, HelpCircle } from 'lucide-react';

const GlobalModal = () => {
    const { modalConfig, closeModal } = useModal();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (modalConfig?.type === 'prompt') {
            setInputValue('');
        }
    }, [modalConfig]);

    if (!modalConfig) return null;

    const { title, message, type, placeholder } = modalConfig;

    const handleConfirm = () => {
        if (type === 'prompt') {
            closeModal(inputValue);
        } else {
            closeModal(true);
        }
    };

    const handleCancel = () => {
        closeModal(null);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={handleCancel}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 sm:p-8">
                    {/* Icon & Title */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${type === 'prompt' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                            {type === 'prompt' ? <HelpCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            {title || (type === 'prompt' ? 'Input Required' : 'Are you sure?')}
                        </h3>
                    </div>

                    {/* Message */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {message}
                    </p>

                    {/* Prompt Input */}
                    {type === 'prompt' && (
                        <div className="mb-6">
                            <input
                                type="text"
                                autoFocus
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={placeholder || "Type here..."}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirm();
                                    if (e.key === 'Escape') handleCancel();
                                }}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md ${type === 'prompt' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                        >
                            {type === 'prompt' ? 'Submit' : 'Confirm'}
                        </button>
                    </div>
                </div>

                {/* Close X */}
                <button
                    onClick={handleCancel}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default GlobalModal;
