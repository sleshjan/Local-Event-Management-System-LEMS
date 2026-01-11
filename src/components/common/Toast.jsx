import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ id, message, type, onClose, duration }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-7 h-7 text-green-500" />,
        error: <XCircle className="w-7 h-7 text-red-500" />,
        warning: <AlertCircle className="w-7 h-7 text-yellow-500" />,
        info: <Info className="w-7 h-7 text-blue-500" />,
    };

    const styles = {
        success: 'bg-green-50 border-green-100 text-green-800',
        error: 'bg-red-50 border-red-100 text-red-800',
        warning: 'bg-yellow-50 border-yellow-100 text-yellow-800',
        info: 'bg-blue-50 border-blue-100 text-blue-800',
    };

    return (
        <div className={`flex items-center gap-4 p-5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-right-full ${styles[type] || styles.info}`}>
            <div className="shrink-0">
                {icons[type] || icons.info}
            </div>
            <p className="text-lg font-medium flex-1 leading-relaxed">
                {message}
            </p>
            <button
                onClick={() => onClose(id)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                aria-label="Close"
            >
                <X className="w-5 h-5 opacity-50" />
            </button>
        </div>
    );
};

export default Toast;
