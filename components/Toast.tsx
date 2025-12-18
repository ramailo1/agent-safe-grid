import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string, duration?: number) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, title: string, message?: string, duration = 5000) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const toast: Toast = { id, type, title, message, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    }, [removeToast]);

    const success = useCallback((title: string, message?: string) => showToast('success', title, message), [showToast]);
    const error = useCallback((title: string, message?: string) => showToast('error', title, message, 7000), [showToast]);
    const warning = useCallback((title: string, message?: string) => showToast('warning', title, message), [showToast]);
    const info = useCallback((title: string, message?: string) => showToast('info', title, message), [showToast]);

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'error': return <XCircle className="w-5 h-5" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            case 'info': return <Info className="w-5 h-5" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success': return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
            case 'error': return 'bg-rose-500/10 border-rose-500/50 text-rose-400';
            case 'warning': return 'bg-amber-500/10 border-amber-500/50 text-amber-400';
            case 'info': return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`${getStyles(toast.type)} border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 fade-in duration-200`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {getIcon(toast.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-white">{toast.title}</h4>
                                {toast.message && (
                                    <p className="text-xs text-slate-300 mt-1">{toast.message}</p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
