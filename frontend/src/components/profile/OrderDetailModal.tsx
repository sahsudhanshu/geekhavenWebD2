import { useEffect, useState, useCallback } from 'react';
import { X, Loader2 } from 'lucide-react';
import API from '../../services/useFetch';
import { useAuth } from '../../context/authContext';
import type { OrderUI } from './orderHistory';

interface FullOrder extends OrderUI {
  discountTotal?: number;
  taxTotal?: number;
  shippingFee?: number;
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: { provider?: string; last4?: string; txnId?: string };
  timeline?: { status: string; at: string; note?: string }[];
  status: string;
}

interface Props {
  orderId: string | null;
  onClose: () => void;
  onStatusChange?: (orderId: string, status: string) => void;
}

const fmtINR = (n: number | undefined) => (n == null ? '-' : n.toLocaleString('en-IN'));
const fmtDateTime = (d?: string) => d ? new Date(d).toLocaleString() : '-';

export const OrderDetailModal = ({ orderId, onClose, onStatusChange }: Props) => {
  const { token } = useAuth();
  const [order, setOrder] = useState<FullOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!orderId || !token) return;
    setLoading(true); setError(null);
    try {
      const { data } = await API.get(`/orders/${orderId}`, token);
      setOrder(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load order');
    } finally { setLoading(false); }
  }, [orderId, token]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const canCancel = order && ['Pending', 'Processing'].includes(order.status);

  const handleCancel = async () => {
    if (!order || !token) return;
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await API.post(`/orders/${order._id}/cancel`, {}, token);
      setOrder(data.order);
      onStatusChange?.(order._id, data.order.status);
    } catch (e: any) {
      alert(e.message || 'Cancel failed');
    } finally { setCancelling(false); }
  };

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Order Details</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-5 space-y-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><Loader2 className="animate-spin" size={16} /> Loading...</div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 p-4 rounded-md text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchDetail} className="underline">Retry</button>
            </div>
          )}
          {order && !loading && !error && (
            <>
              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Order</h3>
                  <p className="text-gray-800 dark:text-gray-200 text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Placed: {fmtDateTime(order.createdAt)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status: {order.status}</p>
                </div>
                <div className="text-sm">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Amounts</h3>
                  <ul className="space-y-0.5">
                    <li className="flex justify-between"><span>Subtotal</span><span>₹{fmtINR(order.subtotal)}</span></li>
                    {order.discountTotal ? <li className="flex justify-between"><span>Discount</span><span>-₹{fmtINR(order.discountTotal)}</span></li> : null}
                    {order.taxTotal ? <li className="flex justify-between"><span>Tax</span><span>₹{fmtINR(order.taxTotal)}</span></li> : null}
                    {order.shippingFee ? <li className="flex justify-between"><span>Shipping</span><span>₹{fmtINR(order.shippingFee)}</span></li> : null}
                    <li className="flex justify-between font-semibold border-t border-gray-200 dark:border-slate-700 mt-1 pt-1"><span>Total</span><span>₹{fmtINR(order.total)}</span></li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Items</h3>
                <div className="space-y-3">
                  {order.lineItems.map((li, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {li.image && <img src={li.image} className="w-14 h-14 rounded object-cover" alt={li.name} />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{li.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {li.quantity}</p>
                      </div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">₹{fmtINR(li.price)}<span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">x{li.quantity}</span></div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Address</h3>
                  <address className="not-italic text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                    {order.shippingAddress ? (
                      <>
                        {order.shippingAddress.name && <div>{order.shippingAddress.name}</div>}
                        <div>{order.shippingAddress.line1}</div>
                        {order.shippingAddress.line2 && <div>{order.shippingAddress.line2}</div>}
                        <div>{[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode].filter(Boolean).join(', ')}</div>
                        <div>{order.shippingAddress.country}</div>
                        {order.shippingAddress.phone && <div>📞 {order.shippingAddress.phone}</div>}
                      </>
                    ) : '—'}
                  </address>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Payment</h3>
                  {order.paymentMethod ? (
                    <p className="text-xs text-gray-600 dark:text-gray-300">{order.paymentMethod.provider} ****{order.paymentMethod.last4}</p>
                  ) : <p className="text-xs text-gray-500 dark:text-gray-400">Not recorded</p>}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Timeline</h3>
                  {canCancel && (
                    <button onClick={handleCancel} disabled={cancelling} className="text-xs px-3 py-1 rounded-md bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white">
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                </div>
                <ol className="space-y-2 text-xs">
                  {(order.timeline && order.timeline.length ? order.timeline : [{ status: order.status, at: order.createdAt }]).map((t, i) => (
                    <li key={i} className="flex gap-3">
                      <div className="mt-0.5 w-2 h-2 rounded-full bg-indigo-500 dark:bg-sky-400" />
                      <div>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{t.status}</p>
                        <p className="text-gray-500 dark:text-gray-400">{fmtDateTime(t.at)}{t.note ? ` • ${t.note}` : ''}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
