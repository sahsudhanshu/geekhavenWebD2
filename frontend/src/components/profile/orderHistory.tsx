import { useEffect, useState, useCallback } from 'react';
import API from '../../services/useFetch';
import { useAuth } from '../../context/authContext';
import OrderDetailModal from './OrderDetailModal';

// Basic Order types (align with backend Order schema snapshot fields)
export interface OrderLineItemUI {
    product: string; // product id
    name: string; // snapshot name
    image?: string; // snapshot primary image url
    quantity: number;
    price: number; // unit price at purchase
    subtotal: number; // quantity * price (redundant but convenient)
}

export interface OrderUI {
    _id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    subtotal: number;
    total: number;
    lineItems: OrderLineItemUI[];
    currency?: string;
}

interface OrdersResponseCursor {
    items: OrderUI[];
    nextCursor: string | null;
}

const statusColorMap: Record<string, string> = {
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    shipped: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    pending: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
};

const fmtINR = (n: number) => n.toLocaleString('en-IN');

export const OrderHistory = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState<OrderUI[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [initialLoaded, setInitialLoaded] = useState(false);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

    const fetchOrders = useCallback(async (cursor?: string) => {
        if (!token) return; // require auth
        setLoading(true);
        setError(null);
        try {
            const endpoint = `/orders?limit=10${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
            const { data } = await API.get(endpoint, token);
            const payload: OrdersResponseCursor = data;
            setOrders(prev => cursor ? [...prev, ...payload.items] : payload.items);
            setNextCursor(payload.nextCursor);
            setInitialLoaded(true);
        } catch (e: any) {
            setError(e.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const hasMore = !!nextCursor;

    return (
        <div className="space-y-4">
            {!initialLoaded && loading && (
                <div className="animate-pulse space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-slate-800 rounded-lg shadow-sm" />
                    ))}
                </div>
            )}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-md text-sm flex justify-between items-start">
                    <span>{error}</span>
                    <button onClick={() => fetchOrders()} className="underline">Retry</button>
                </div>
            )}
            {orders.map(order => (
                <div key={order._id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm cursor-pointer hover:ring-1 hover:ring-indigo-500/40 transition" onClick={() => setActiveOrderId(order._id)}>
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white">Order #{order.orderNumber || order._id.slice(-6)}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total: <span className="font-bold text-gray-900 dark:text-white">₹{fmtINR(order.total ?? order.subtotal)}</span></p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColorMap[order.status?.toLowerCase()] || statusColorMap.pending}`}>{order.status}</span>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                        {order.lineItems.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 mb-3 last:mb-0">
                                {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">₹{fmtINR(item.price)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            {!loading && !orders.length && !error && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No orders yet.</p>
            )}
            {hasMore && (
                <div className="pt-2">
                    <button
                        disabled={loading}
                        onClick={() => fetchOrders(nextCursor || undefined)}
                        className="px-4 py-2 text-sm rounded-md bg-indigo-600 dark:bg-sky-500 hover:bg-indigo-700 dark:hover:bg-sky-600 text-white disabled:opacity-50"
                    >{loading ? 'Loading...' : 'Load More'}</button>
                </div>
            )}
            {activeOrderId && (
                <OrderDetailModal
                    orderId={activeOrderId}
                    onClose={() => setActiveOrderId(null)}
                    onStatusChange={(id, status) => setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o))}
                />
            )}
        </div>
    );
};

export default OrderHistory;