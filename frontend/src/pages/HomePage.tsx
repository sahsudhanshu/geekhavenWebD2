import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../services/useFetch';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductListHeader } from '../components/ProductListHeader';
import { ProductGrid } from '../components/ProductGrid';
import { pseudoRating, clamp } from '../utils/rating';

interface ListingResponse { items: any[]; nextCursor: string | null }

function useListingSearch() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<ListingResponse>({ items: [], nextCursor: null });
    const [loading, setLoading] = useState(true);
    const categoryParam = searchParams.get('category') || 'all';
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
                const result: any = await API.get(`/products/?${params.toString()}`);
                const payload = result?.data;
                if (payload && Array.isArray(payload.items)) setData({ items: payload.items, nextCursor: payload.nextCursor || null });
                else setData({ items: [], nextCursor: null });
            } catch {
                setData({ items: [], nextCursor: null });
            } finally { setLoading(false); }
        }
        fetchListings();
    }, [searchParams]);

    const maxPriceObserved = useMemo(() => (data.items.length ? Math.max(...data.items.map((p: any) => p.price)) : 100000), [data.items]);
    const categories = useMemo(() => {
        const set = new Set<string>();
        data.items.forEach((p: any) => p.category && set.add(p.category));
        return ['all', ...Array.from(set).sort()];
    }, [data.items]);

    const filteredSorted = useMemo(() => {
        const enriched = data.items.map((p: any) => ({ ...p, rating: clamp(pseudoRating(p._id || p.id || ''), 1, 5) }));
        return enriched
            .filter((p: any) => (categoryParam === 'all' ? true : p.category === categoryParam))
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

    return { data, loading, categoryParam, maxParam, minRatingParam, sortOrder, maxPriceObserved, categories, filteredSorted, updateParam, setSearchParams } as const;
}

function HomePage() {
    const { data, loading, categoryParam, maxParam, minRatingParam, sortOrder, maxPriceObserved, categories, filteredSorted, updateParam, setSearchParams } = useListingSearch();
    return (
        <div className="flex gap-6 px-4 py-6 max-w-7xl mx-auto">
            <FilterSidebar
                categories={categories}
                activeCategory={categoryParam}
                maxPriceObserved={maxPriceObserved}
                maxParam={maxParam}
                minRatingParam={minRatingParam}
                onChangeCategory={(c) => updateParam('category', c)}
                onChangeMax={(v) => updateParam('max', v)}
                onChangeMinRating={(v) => updateParam('minRating', v)}
                onReset={() => setSearchParams(() => new URLSearchParams())}
            />
            <main className="flex-1">
                <ProductListHeader
                    title={categoryParam === 'all' ? 'All Products' : categories.find((c) => c === categoryParam) || 'Products'}
                    sortOrder={sortOrder}
                    onChangeSort={(v) => updateParam('sort', v)}
                />
                <ProductGrid products={filteredSorted} loading={loading} />
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
