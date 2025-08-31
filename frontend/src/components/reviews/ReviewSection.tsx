import { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import API from '../../services/useFetch';

interface Review { _id: string; user: any; name: string; rating: number; comment: string; createdAt: string }
interface Props { productId: string; initialRating?: number; initialNum?: number }

const stars = (n: number) => Array.from({ length: 5 }, (_, i) => i < Math.round(n));

const ReviewSection: React.FC<Props> = ({ productId, initialRating = 0, initialNum = 0 }) => {
    const { token, userDetails } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [rating, setRating] = useState(initialRating);
    const [numReviews, setNumReviews] = useState(initialNum);
    const [myRating, setMyRating] = useState<number>(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            const res = await API.get(`/products/${productId}/reviews`);
            if (res.status === 200) {
                setReviews(res.data.reviews || []);
                setRating(res.data.rating || 0);
                setNumReviews(res.data.numReviews || 0);
                const currentUserId = (userDetails as any)?.id;
                const mine = (res.data.reviews || []).find((r: Review) => (r.user && (r.user as any)._id) === currentUserId || r.user === currentUserId);
                if (mine) { setMyRating(mine.rating); setComment(mine.comment); }
            }
        } catch { }
    };
    useEffect(() => { load(); }, [productId]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!token) return;
        setLoading(true); setError(null);
        try {
            const res = await API.post(`/products/${productId}/reviews`, { rating: myRating, comment }, token);
            if (res.status === 201) {
                setReviews(res.data.reviews); setRating(res.data.rating); setNumReviews(res.data.numReviews);
            } else setError(res.data?.message || 'Failed');
        } catch (e: any) { setError(e.message || 'Failed'); } finally { setLoading(false); }
    };

    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold mb-2">Ratings & Reviews</h2>
            <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                    {stars(rating).map((f, i) => <span key={i} className={f ? 'text-yellow-500' : 'text-gray-300'}>★</span>)}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{rating.toFixed(1)} ({numReviews})</span>
            </div>
            <ul className="space-y-4 mb-8">
                {reviews.map(r => (
                    <li key={r._id} className="border rounded-md p-3 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{r.name}</span>
                            <div className="flex text-xs">{stars(r.rating).map((f, i) => <span key={i} className={f ? 'text-yellow-500' : 'text-gray-300'}>★</span>)}</div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{r.comment}</p>
                        <p className="text-[10px] mt-1 text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                    </li>
                ))}
                {!reviews.length && <li className="text-sm text-gray-500">No reviews yet.</li>}
            </ul>
            {token && (
                <form onSubmit={submit} className="space-y-3 max-w-md">
                    <div>
                        <label className="block text-sm font-medium mb-1">Your Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                                <button type="button" key={n} onClick={() => setMyRating(n)} className={`text-2xl leading-none ${n <= myRating ? 'text-yellow-500' : 'text-gray-300'} hover:scale-110 transition`}>★</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Comment</label>
                        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} required className="w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-800" placeholder="Share your experience" />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button disabled={loading || !myRating} className="px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-60" style={{ background: 'var(--seed-accent)' }}>{loading ? 'Saving...' : 'Submit Review'}</button>
                </form>
            )}
            {!token && <p className="text-sm text-gray-500">Log in to write a review.</p>}
        </section>
    );
};

export default ReviewSection;