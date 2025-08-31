import React, { useMemo, useState } from 'react';
import { computeFrontPlatformFee, getPlatformFeePercent } from '../utils/seed';
import { useAuth } from '../context/authContext';
import API from '../services/useFetch';
import { useActionLog } from '../hooks/useActionLog';

interface CartSummaryProps {
    items: { id: string | number; title: string; price: number; quantity: number }[];
}

export const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
    const { token } = useAuth() as any;
    const { push } = useActionLog();
    const [checkingOut, setCheckingOut] = useState(false);
    const [success, setSuccess] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const subtotal = useMemo(() => items.reduce((acc, it) => acc + it.price * it.quantity, 0), [items]);
    const platformFee = computeFrontPlatformFee(subtotal);
    const feePercent = getPlatformFeePercent();
    const total = +(subtotal + platformFee).toFixed(2);

    async function handleCheckout() {
        if (!token || items.length === 0 || checkingOut) return;
        setCheckingOut(true); setError(null);
    const idem = (self.crypto && 'randomUUID' in self.crypto) ? (self.crypto as any).randomUUID() : Math.random().toString(36).slice(2);
        push('checkout:attempt', { idem, count: items.length });
        try {
            const res = await API.post('/checkout', { shippingAddress: { line1: 'NA' } }, token, undefined, { 'Idempotency-Key': idem });
            setSuccess(res.data);
            push('checkout:success', { order: res.data?.orderNumber });
        } catch (e: any) {
            setError(e.message || 'Checkout failed');
        } finally { setCheckingOut(false); }
    }

    return (
        <div className="p-4 rounded-lg border bg-white/70 dark:bg-slate-800/70 flex flex-col gap-2 text-sm">
            <h3 className="text-base font-semibold mb-1 text-seed-accent">Order Summary</h3>
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Platform Fee ({feePercent}%)</span><span>₹{platformFee.toFixed(2)}</span></div>
            <div className="h-px bg-gray-200 dark:bg-slate-700 my-1" />
            <div className="flex justify-between font-medium text-[15px]"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
            <button onClick={handleCheckout} className="mt-3 rounded-md px-4 py-2 font-semibold shadow disabled:opacity-60 bg-seed-accent bg-seed-accent-hover" disabled={items.length === 0 || checkingOut}>{checkingOut ? 'Processing…' : success ? 'Completed' : 'Checkout'}</button>
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
            {success && <div className="text-xs text-green-600 mt-1">Order {success.orderNumber} placed (Total ${success.total})</div>}
        </div>
    );
};

export default CartSummary;
