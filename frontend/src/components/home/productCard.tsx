import { Link, useNavigate } from "react-router-dom"
import { seededChecksum } from "../../utils/seed"
import { useState, useEffect } from "react"
import { useActionLog } from "../../hooks/useActionLog"
import { useAuth } from "../../context/authContext"
import api from "../../services/useFetch"
import { Heart, Bookmark, ShoppingCart } from 'lucide-react'

export function ProductCard({ id, title, price, imageUrl, sellerId, likesCount: initialLikesCount = 0, liked: initialLiked, bookmarked: initialBookmarked, likes, inCart }: { id: string; title: string; price: number; imageUrl?: string; sellerId: string; likesCount?: number; liked?: boolean; bookmarked?: boolean; likes?: (string | { _id: string })[]; inCart?: boolean }) {
    const navigate = useNavigate();
    const { push } = useActionLog();
    const { token, userDetails } = useAuth() as any;

    const [liked, setLiked] = useState<boolean>(!!initialLiked);
    const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
    const [bookmarking, setBookmarking] = useState(false);
    const [liking, setLiking] = useState(false);
    const [addingCart, setAddingCart] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);
    const [bookmarked, setBookmarked] = useState<boolean>(!!initialBookmarked);

    // Sync on prop changes or likes array updates (mirrors ProductDetailPage logic)
    useEffect(() => {
        const uid = userDetails?._id;
        let nextLiked = !!initialLiked;
        if (!nextLiked && uid && Array.isArray(likes)) {
            nextLiked = likes.some((item: any) => (item?._id || item) === uid);
        }
        if (nextLiked !== liked) setLiked(nextLiked);
        const nextBookmarked = !!initialBookmarked;
        if (nextBookmarked !== bookmarked) setBookmarked(nextBookmarked);
    }, [likes, initialLiked, initialBookmarked, userDetails?._id]);

    // Initialize cart state from props (only ever set true; don't force false to preserve add-only UX)
    useEffect(() => {
        if (inCart) setCartAdded(true);
    }, [inCart]);

    const ensureAuth = () => {
        if (!token) { navigate('/login'); return false; }
        return true;
    }

    const handleLike = async () => {
        if (!ensureAuth()) return;
        if (liking) return;
        setLiking(true);
        const optimistic = !liked;
        setLiked(optimistic);
        setLikesCount(c => c + (optimistic ? 1 : -1));
        push('like_toggle', { id });
        try {
            const res = await api.post(`/products/${id}/like`, {}, token);
            if (res.status === 200) {
                setLiked(res.data.liked);
                setLikesCount(res.data.likesCount);
            }
        } catch {
            setLiked(!optimistic);
            setLikesCount(initialLikesCount);
        } finally { setLiking(false); }
    }

    const handleBookmark = async () => {
        if (!ensureAuth()) return;
        if (bookmarking) return;
        setBookmarking(true);
        const optimistic = !bookmarked;
        setBookmarked(optimistic);
        push('bookmark_toggle', { id });
        try {
            const res = await api.post(`/products/${id}/bookmark`, {}, token);
            if (res.status === 200) setBookmarked(res.data.bookmarked);
        } catch {
            setBookmarked(!optimistic);
        } finally { setBookmarking(false); }
    }

    const handleAddToCart = async () => {
        if (!ensureAuth()) return;
        if (addingCart || cartAdded) return; // prevent duplicate adds once added
        setAddingCart(true);
        try {
            await api.post(`/cart/${id}`, { quantity: 1 }, token);
            // Permanently mark as added (add-only behavior)
            setCartAdded(true);
            push('add_to_cart', { id });
        } catch { /* ignore for now */ }
        finally { setAddingCart(false); }
    }

    return (
        <div className="rounded-lg border border-gray-200 dark:border-slate-700 p-3 flex flex-col gap-3 bg-white dark:bg-slate-800 transition-colors group">
            <Link to={`/products/${id}`} className="group">
                <img
                    src={
                        imageUrl ||
                        `/placeholder.svg?height=200&width=300&query=product%20image%20placeholder`
                    }
                    alt={`${title} image`}
                    className="w-full h-40 object-cover rounded-md"
                />
                <div className="mt-2">
                    <h3 className="text-pretty font-semibold group-hover:text-brand transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">ID: {seededChecksum(id)}</p>
                    <p className="text-lg font-semibold mt-1">₹{price.toFixed(2)}</p>
                </div>
            </Link>
            <div className="flex items-center justify-between mt-auto pt-1">
                <Link to={`/seller/${sellerId}`} className="text-xs font-medium text-accent hover:underline">
                    Seller profile
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        aria-pressed={liked}
                        disabled={liking}
                        onClick={handleLike}
                        className={`h-8 w-8 inline-flex items-center justify-center rounded-full border transition text-xs ${liked ? 'border-red-500 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'border-gray-300 dark:border-slate-600 text-gray-500 hover:text-red-500'} disabled:opacity-50`}
                        title={liked ? 'Unlike' : 'Like'}
                    >
                        <Heart size={16} className={liked ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''} />
                        {likesCount > 0 && <span className="sr-only">{likesCount}</span>}
                    </button>
                    <button
                        aria-pressed={bookmarked}
                        disabled={bookmarking}
                        onClick={handleBookmark}
                        className={`h-8 w-8 inline-flex items-center justify-center rounded-full border transition text-xs ${bookmarked ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 'border-gray-300 dark:border-slate-600 text-gray-500 hover:text-indigo-500'} disabled:opacity-50`}
                        title={bookmarked ? 'Unsave' : 'Save'}
                    >
                        <Bookmark size={16} className={bookmarked ? 'fill-indigo-500 dark:fill-indigo-400' : ''} />
                    </button>
                    <button
                        disabled={addingCart || cartAdded}
                        onClick={handleAddToCart}
                        className={`px-3 h-8 inline-flex items-center gap-1 justify-center rounded-md text-xs font-medium shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-[var(--seed-accent)] ${cartAdded
                            ? 'bg-emerald-600 text-white'
                            : 'text-white'} btn-accent`}
                        style={!cartAdded ? { background: 'var(--seed-accent)' } : undefined}
                        title={cartAdded ? 'Already in cart' : 'Add to cart'}
                    >
                        <ShoppingCart size={14} className={cartAdded ? '' : ''} />
                        {cartAdded ? 'Added' : addingCart ? 'Adding...' : 'Add'}
                    </button>
                </div>
            </div>
            {likesCount > 0 && (
                <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Heart size={12} className={liked ? 'fill-red-500 text-red-500 dark:fill-red-400 dark:text-red-400' : ''} />
                    {likesCount} like{likesCount === 1 ? '' : 's'}
                </div>
            )}
            {cartAdded && <div className="text-[11px] font-medium text-green-600 dark:text-green-400">Added to cart</div>}
        </div>
    )
}
