import { useToast } from '../../context/ToastContext';
import Toast from './Toast';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-md pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
