import React, { useEffect, useState } from 'react';
import type { Toast, ToastType } from '../types/toast';

const ICONS: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

const CONFIG: Record<ToastType, { classes: string; iconAnimation: string }> = {
    success: { classes: 'bg-gradient-to-br from-green-500 to-green-600 text-white', iconAnimation: 'animate-bounce-in' },
    error: { classes: 'bg-gradient-to-br from-red-500 to-red-600 text-white', iconAnimation: 'animate-shake' },
    warning: { classes: 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-slate-800', iconAnimation: '' },
    info: { classes: 'bg-gradient-to-br from-sky-500 to-sky-600 text-white', iconAnimation: '' },
};

interface ToastMessageProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

export const ToastMessage: React.FC<ToastMessageProps> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);
    const { id, type, title, message } = toast;

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isExiting) {
            const timer = setTimeout(() => onDismiss(id), 500); // Wait for animation to finish
            return () => clearTimeout(timer);
        }
    }, [isExiting, onDismiss, id]);

    const config = CONFIG[type];
    const icon = ICONS[type];

    return (
        <div
            className={
                'flex items-center p-4 rounded-xl shadow-lg min-w-[320px] border border-white/10 ' +
                config.classes + ' ' +
                (isExiting ? 'animate-slide-out' : 'animate-slide-in')
            }
            role="alert"
            aria-live="assertive"
        >
            <div className={'text-2xl mr-4 ' + config.iconAnimation}>{icon}</div>
            <div>
                <strong className="font-semibold">{title}</strong>
                <p className="text-sm opacity-90">{message}</p>
            </div>
        </div>
    );
};
