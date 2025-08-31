import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/useFetch';
import { FilterSidebar } from '../components/home/FilterSidebar';
import { ProductGrid } from '../components/home/ProductGrid';
import { useAuth } from '../context/authContext';

interface ListingResponse { items: any[]; nextCursor: string | null }

function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<ListingResponse>({ items: [], nextCursor: null });
    const [loading, setLoading] = useState(true);
    const { token } = useAuth() as any;
    const [cartIds, setCartIds] = useState<Set<string>>(new Set());
    const categoryParam = searchParams.get('category') || 'all';
    const minParam = Number(searchParams.get('min') || 0) || undefined;
    const maxParam = Number(searchParams.get('max') || 0) || undefined;
    const minRatingParam = Number(searchParams.get('minRating') || 0);
    const sortOrder = searchParams.get('sort') || 'newest';
    useEffect(() => {
        async function fetchListings() {
            setLoading(true);
            const params = new URLSearchParams();
            const keys = ['q', 'category', 'min', 'max', 'cursor'];
            keys.forEach(k => { const v = searchParams.get(k); if (v) params.set(k, v); });
            try {
                const result: any = await API.get(`/products/?${params.toString()}`, token || undefined);
                const payload = result?.data;
                if (payload && Array.isArray(payload.items)) setData({ items: payload.items, nextCursor: payload.nextCursor || null });
                else setData({ items: [], nextCursor: null });
            } catch {
                setData({ items: [], nextCursor: null });
            } finally { setLoading(false); }
        }
        fetchListings();
    }, [searchParams, token]);

    // Fetch cart items for auth user to sync inCart state
    useEffect(() => {
        if (!token) { setCartIds(new Set()); return; }
        let abort = false;
        (async () => {
            try {
                const res: any = await API.get('/cart', token);
                if (!abort && res?.data?.items) {
                    const ids = new Set<string>(res.data.items.map((it: any) => it.product?._id || it.product?.id || it.product));
                    setCartIds(ids);
                }
            } catch { /* ignore */ }
        })();
        return () => { abort = true; };
    }, [token]);

    const categories = useMemo(() => {
        const set = new Set<string>();
        data.items.forEach((p: any) => p.category && set.add(p.category));
        return ['all', ...Array.from(set).sort()];
    }, [data.items]);

    const filteredSorted = useMemo(() => {
        return data.items
            .filter((p: any) => (categoryParam === 'all' ? true : p.category === categoryParam))
            .filter((p: any) => (minParam ? p.price >= minParam : true))
            .filter((p: any) => (maxParam ? p.price <= maxParam : true))
            .filter((p: any) => p.rating >= minRatingParam)
            .sort((a: any, b: any) => {
                switch (sortOrder) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'newest':
                    default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
            });
    }, [data.items, categoryParam, maxParam, minRatingParam, sortOrder]);

    const updateParam = (key: string, value: string | number | null) => {
        setSearchParams(prev => {
            const p = new URLSearchParams(prev);
            if (value === null || value === '' || (typeof value === 'number' && isNaN(value))) p.delete(key); else p.set(key, String(value));
            p.delete('cursor');
            return p;
        });
    };
    return (
        <div className="flex gap-6 px-4 py-6 max-w-7xl mx-auto">
            <FilterSidebar
                categories={categories}
                activeCategory={categoryParam}
                minParam={minParam}
                maxParam={maxParam}
                minRatingParam={minRatingParam}
                onChangeCategory={(c) => updateParam('category', c)}
                onChangeMin={(v) => updateParam('min', v)}
                onChangeMax={(v) => updateParam('max', v)}
                onChangeMinRating={(v) => updateParam('minRating', v)}
                onReset={() => setSearchParams(() => new URLSearchParams())}
            />
            <main className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{categoryParam === 'all' ? 'All Products' : categories.find((c) => c === categoryParam) || 'Products'}</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <select
                                value={sortOrder}
                                onChange={(e) => updateParam('sort', e.target.value)}
                                className="appearance-none rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 pl-3 pr-8 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-sky-500"
                            >
                                <option value="newest">Newest</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
                        </div>
                    </div>
                </div>
                <ProductGrid products={filteredSorted} loading={loading} cartIds={cartIds} />
                <div className="flex justify-center mt-8">
                    {data.nextCursor ? (
                        <button
                            className="px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm"
                            style={{ background: 'var(--seed-accent)' }}
                            onClick={() => {
                                setSearchParams(prev => { const params = new URLSearchParams(prev); params.set('cursor', data.nextCursor || ''); return params; });
                            }}
                        >
                            Load more
                        </button>
                    ) : (!loading && <span className="text-sm text-gray-500 dark:text-gray-400">End of results</span>)}
                </div>
            </main>
        </div>
    );
}

export default HomePage;
