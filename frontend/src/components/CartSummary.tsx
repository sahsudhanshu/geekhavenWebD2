import React, { useMemo } from 'react';
import { computeFrontPlatformFee, getPlatformFeePercent } from '../utils/seed';

interface CartSummaryProps {
    items: { id: string | number; title: string; price: number; quantity: number }[];
}

export const CartSummary: React.FC<CartSummaryProps> = ({ items }) => {
    const subtotal = useMemo(() => items.reduce((acc, it) => acc + it.price * it.quantity, 0), [items]);
    const platformFee = computeFrontPlatformFee(subtotal);
    const feePercent = getPlatformFeePercent();
    const total = +(subtotal + platformFee).toFixed(2);

    return (
        <div className="p-4 rounded-lg border bg-white/70 dark:bg-slate-800/70 flex flex-col gap-2 text-sm">
            <h3 className="text-base font-semibold mb-1 text-seed-accent">Order Summary</h3>
            <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Platform Fee ({feePercent}%)</span><span>${platformFee.toFixed(2)}</span></div>
            <div className="h-px bg-gray-200 dark:bg-slate-700 my-1" />
            <div className="flex justify-between font-medium text-[15px]"><span>Total</span><span>${total.toFixed(2)}</span></div>
            <button className="mt-3 rounded-md px-4 py-2 font-semibold shadow disabled:opacity-60 bg-seed-accent bg-seed-accent-hover" disabled={items.length === 0}>Checkout</button>
        </div>
    );
};

export default CartSummary;
