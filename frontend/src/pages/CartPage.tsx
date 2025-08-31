import React, { useEffect, useState } from 'react';
import API from '../services/useFetch';
import { useAuth } from '../context/authContext';
import CartSummary from '../components/CartSummary';
import ChecksumBadge from '../components/ChecksumBadge';
import { useActionLog } from '../hooks/useActionLog';

interface CartItem {
  product: {
    _id: string;
    name?: string;
    title?: string; // fallback to fakestore style
    price: number;
    imageUrl?: string;
    images?: string[];
  };
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
}

const CartPage: React.FC = () => {
  const { token } = useAuth();
  const { push } = useActionLog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return; // Protected externally or redirect logic could go here
      setLoading(true); setError(null);
      try {
        const res = await API.get('/cart', token);
        const data: CartResponse = res.data;
        setItems(data.items || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const flatItems = items.map(ci => ({
    id: ci.product._id,
    title: ci.product.name || ci.product.title || 'Product',
    price: ci.product.price,
    quantity: ci.quantity
  }));

  async function updateQuantity(id: string, newQty: number) {
    if (!token) return;
    push('cart:updateQty', { id, newQty });
    try {
      const res = await API.post(`/cart/${id}`, { quantity: newQty }, token);
      setItems(res.data.items || []);
    } catch (e) {
      console.error(e);
    }
  }

  async function removeItem(id: string) {
    if (!token) return;
    push('cart:remove', { id });
    try {
      const res = await API.delete(`/cart/${id}`, undefined, token);
      setItems(res.data.items || []);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
  <h1 className="text-3xl font-bold tracking-tight text-seed-accent">Your Cart</h1>
      {error && <div className="p-3 rounded-md bg-red-100 text-red-700 text-sm">{error}</div>}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading && flatItems.length === 0 && <p className="text-sm text-gray-500">Cart is empty.</p>}
          {flatItems.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border bg-white/70 dark:bg-slate-800/70">
              <div className="flex-1 space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-medium">{item.title}</h3>
                  <ChecksumBadge id={item.id} />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Qty:</span>
                  <div className="inline-flex items-center rounded-md border overflow-hidden">
                    <button className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => updateQuantity(String(item.id), Math.max(1, item.quantity - 1))} disabled={item.quantity <= 1}>-</button>
                    <span className="px-2 py-1 font-mono text-gray-700 dark:text-gray-200">{item.quantity}</span>
                    <button className="px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-slate-700" onClick={() => updateQuantity(String(item.id), item.quantity + 1)}>+</button>
                  </div>
                  <button className="text-red-600 hover:underline ml-2" onClick={() => removeItem(String(item.id))}>Remove</button>
                </div>
              </div>
              <div className="font-mono text-sm">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <CartSummary items={flatItems} />
      </div>
    </div>
  );
};

export default CartPage;
