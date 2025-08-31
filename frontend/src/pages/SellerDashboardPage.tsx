import { useEffect, useState } from 'react';
import { List, PlusCircle } from 'lucide-react';
import clsx from 'clsx';
import API from '../services/useFetch';
import { useAuth } from '../context/authContext';
import { type ProductItem as Product } from '../components/seller/SellerProductList';
import NewProductForm from '../components/seller/NewProductForm';

interface CursorListing { items: Product[]; nextCursor: string | null }

const SellerDashboardPage: React.FC = () => {
    const { token, userDetails } = useAuth();
    const [activeTab, setActiveTab] = useState<'listings' | 'add-product'>('listings');
    const [list, setList] = useState<Product[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isSeller = (userDetails as any)?.role === 'seller' || (userDetails as any)?.role === 'admin';

    const fetchProducts = async (cursor?: string | null, append = false) => {
        if (!token) return;
        setLoading(true); setError(null);
        try {
            const url = `/products/mine${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`;
            const res = await API.get(url, token);
            if (res.status === 200) {
                const data: CursorListing = res.data;
                setList(prev => append ? [...prev, ...data.items] : data.items);
                setNextCursor(data.nextCursor);
            } else setError(res.data?.message || 'Failed to load');
        } catch { setError('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (token && isSeller) fetchProducts(); }, [token, isSeller]);

    const handleDelete = async (id: string) => {
        if (!token) return;
        if (!confirm('Delete this product?')) return;
        try {
            const res = await API.delete(`/products/${id}`, token);
            if (res.status === 200) fetchProducts();
        } catch { }
    };

    const handleSuccess = (p: Product) => {
        setList(prev => {
            const idx = prev.findIndex(x => x._id === p._id);
            if (idx >= 0) { const clone = [...prev]; clone[idx] = p; return clone; }
            return [p, ...prev];
        });
        setEditing(null);
        setActiveTab('listings');
    };

    const tabs = [
        { id: 'listings', name: 'My Listings', icon: <List size={18} /> },
        { id: 'add-product', name: editing ? 'Edit Product' : 'List New Product', icon: <PlusCircle size={18} /> },
    ];

    if (!isSeller) {
        return <div className="max-w-3xl mx-auto py-16 text-center">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Seller Access Required</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your account is not marked as a seller. Contact support to upgrade.</p>
        </div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Seller Dashboard</h1>
            <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'listings' | 'add-product')}
                            className={clsx(
                                'flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium',
                                activeTab === tab.id ? 'border-accent-500 text-accent-600 dark:text-accent-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'
                            )}
                        >
                            {tab.icon} {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
            <div>
                {activeTab === 'listings' && (
                    <div className="space-y-4">
                        <ul className="bg-white dark:bg-slate-800 shadow-sm rounded-lg divide-y divide-gray-200 dark:divide-slate-700">
                            {loading && !list.length && <li className="p-6 text-sm text-gray-500">Loading...</li>}
                            {!loading && !list.length && <li className="p-6 text-sm text-gray-500">No listings yet.</li>}
                            {list.map(prod => (
                                <li key={prod._id} className="p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                                        {prod.images?.length ? <img src={prod.images[0].url} className="h-full w-full object-cover" /> : <span className="text-xs text-gray-500">IMG</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-accent-600 dark:text-accent-400 truncate">{prod.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">₹{prod.price.toLocaleString()} · {prod.status}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => { setEditing(prod); setActiveTab('add-product'); }} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700">Edit</button>
                                        <button onClick={() => handleDelete(prod._id)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50">Delete</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {nextCursor && (
                            <div className="flex justify-center">
                                <button disabled={loading} onClick={() => fetchProducts(nextCursor, true)} className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-60" style={{ background: 'var(--seed-accent)' }}>
                                    {loading ? 'Loading…' : 'Load more'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'add-product' && <NewProductForm editing={editing} onCancelEdit={() => setEditing(null)} onSuccess={handleSuccess} />}
            </div>
        </div>
    );
};

export default SellerDashboardPage;
