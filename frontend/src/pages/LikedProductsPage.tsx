import React, { useEffect, useState } from 'react';
import API from '../services/useFetch';
import { useAuth } from '../context/authContext';
import { ProductGrid } from '../components/home/ProductGrid';

const LikedProductsPage: React.FC = () => {
  const { token } = useAuth() as any;
  const [items, setItems] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = async (reset = false) => {
    if (!token) { setItems([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await API.get(`/favorites/liked?limit=12${reset || !cursor ? '' : `&cursor=${cursor}`}`, token);
      const data = res.data;
      setNextCursor(data.nextCursor || null);
      setItems(prev => reset ? (data.items || []) : [...prev, ...(data.items || [])]);
    } catch { if (reset) setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(true); }, [token]);
  return <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-6">Liked Products</h1>
    <ProductGrid products={items} loading={loading} />
    {!loading && items.length === 0 && <div className="mt-10 text-sm text-gray-500">No liked products yet.</div>}
    {nextCursor && <div className="mt-6 flex justify-center"><button className="px-4 py-2 rounded-md text-white text-sm" style={{ background: 'var(--seed-accent)' }} disabled={loading} onClick={() => { setCursor(nextCursor); load(); }}>Load More</button></div>}
  </div>;
};
export default LikedProductsPage;
