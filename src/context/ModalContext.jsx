import { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState(null);

    const showModal = useCallback((config) => {
        return new Promise((resolve) => {
            setModalConfig({
                ...config,
                resolve,
            });
        });
    }, []);

    const confirm = useCallback((title, message) => {
        return showModal({
            title,
            message,
            type: 'confirm',
        });
    }, [showModal]);

    const prompt = useCallback((title, message, placeholder = '') => {
        return showModal({
            title,
            message,
            placeholder,
            type: 'prompt',
        });
    }, [showModal]);

    const closeModal = useCallback((value) => {
        if (modalConfig?.resolve) {
            modalConfig.resolve(value);
        }
        setModalConfig(null);
    }, [modalConfig]);

    return (
        <ModalContext.Provider value={{ confirm, prompt, modalConfig, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
