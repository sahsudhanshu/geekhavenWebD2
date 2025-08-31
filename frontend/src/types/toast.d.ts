export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message: string;
}

export type ToastOptions = Omit<Toast, 'id' | 'type'>;