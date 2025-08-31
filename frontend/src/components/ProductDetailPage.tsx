import React, { useEffect, useState } from 'react';
import { useLoaderData, useNavigate, type LoaderFunctionArgs } from 'react-router-dom';
import api from '../services/useFetch';
import { useAuth } from '../context/authContext';
import ChecksumBadge from './ChecksumBadge';
import ReviewSection from './reviews/ReviewSection';
import { Heart, Bookmark } from 'lucide-react';

export const productDetailLoader = async ({ params }: LoaderFunctionArgs): Promise<any> => {
    const { id } = params;
    if (!id) throw new Response('Product ID not found', { status: 400 });
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        let apiRes: { status: number; data: any } | null = null;
        apiRes = await api.get(`/products/${id}`, undefined, controller.signal);
        clearTimeout(timeout);
        if (!apiRes) throw new Response('Unknown error', { status: 500 });
        const { status, data } = apiRes;
        if (status === 404) throw new Response('Product not found', { status: 404 });
        if (!data || typeof data !== 'object') throw new Response('Malformed product data', { status: 502 });
        return data;
    } catch (e: any) {
        if (e instanceof Response) throw e;
        if (e?.name === 'CanceledError' || e?.name === 'AbortError') throw new Response('Request timed out', { status: 504 });
        const status = e?.response?.status;
        if (status === 404) throw new Response('Product not found', { status: 404 });
        throw new Response('Network error while loading product', { status: 502 });
    }
};
const ProductDetailPage: React.FC = () => {
    const product: any = useLoaderData();
    const { token, userDetails } = useAuth() as { token?: string; userDetails?: { _id?: string } };
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [liked, setLiked] = useState<boolean>(false);
    const [bookmarked, setBookmarked] = useState<boolean>(false);
    const isValidProduct = product && !product.error && (product._id || product.name);
    const [likesCount, setLikesCount] = useState<number>(isValidProduct ? (product.likesCount || 0) : 0);

    useEffect(() => {
        if (userDetails?._id) {
            if(product.likes.find((item: any) => item._id === userDetails._id)){
                setLiked(true);
            }
        }
    }, [])

    const toggleLike = async () => {
        if (!token) return alert('Login to like products');
        if (!isValidProduct) return;
        try {
            const prodId = product._id || product.id;
            const res = await api.post(`/products/${prodId}/like`, {}, token);
            if (res.status === 200) {
                setLikesCount(res.data.likesCount);
                setLiked(res.data.liked);
            }
        } catch (e) { console.error(e); }
    };
    const toggleBookmark = async () => {
        if (!token) return alert('Login to bookmark products');
        if (!isValidProduct) return;
        try {
            const prodId = product._id || product.id;
            const res = await api.post(`/products/${prodId}/bookmark`, {}, token);
            if (res.status === 200) setBookmarked(res.data.bookmarked);
        } catch (e) { console.error(e); }
    }

    const handleAddToCart = async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (!isValidProduct) return;
        try {
            const prodId = product._id || product.id;
            await api.post(`/cart/${prodId}`, { quantity: 1 }, token);
            setSuccessMessage('Product added to cart!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to add to cart', error);
            alert('Failed to add item to cart.');
        }
    };

    return (
        <div className="max-w-6xl mx-auto my-8 p-8 bg-white dark:bg-slate-900 rounded-lg shadow-sm transition-colors">
            {!isValidProduct && (
                <div className="p-6 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                    Failed to load product details. Please refresh or go back.
                </div>
            )}
            {isValidProduct && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="flex items-center justify-center p-8 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                            <img src={(product.images && product.images[0]?.url) || 'https://via.placeholder.com/400'} alt={product.name || product.title} className="max-h-[400px] w-full object-contain" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-0">{product.category}</p>
                                <ChecksumBadge id={product._id || product.id} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">{product.name || product.title}</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">Condition: <strong>{product.condition || 'N/A'}</strong></p>
                            <p className="text-4xl font-bold text-[#b12704] my-4">₹{Number(product.price || 0).toLocaleString()}</p>
                            <div className="flex items-center gap-4 mb-4">
                                <button onClick={toggleLike} className={`inline-flex items-center gap-1 text-sm ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`} aria-label="Like product">
                                    <Heart size={18} className={liked ? 'fill-red-500 text-red-500' : ''} /> {likesCount}
                                </button>
                                <button onClick={toggleBookmark} className={`inline-flex items-center gap-1 text-sm ${bookmarked ? 'text-indigo-500' : 'text-gray-500 hover:text-indigo-500'}`} aria-label="Bookmark product">
                                    <Bookmark size={18} className={bookmarked ? 'fill-indigo-500 text-indigo-500' : ''} />
                                </button>
                            </div>
                            <button className="btn-accent rounded-lg px-6 py-3 w-full text-lg font-semibold flex items-center justify-center" onClick={handleAddToCart} disabled={!isValidProduct}>
                                Add to Cart
                            </button>
                            {successMessage && <p className="text-green-600 font-semibold mt-4">{successMessage}</p>}
                            <p className="my-8 leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">{product.description}</p>
                        </div>
                    </div>
                    <ReviewSection productId={product._id || product.id} initialRating={product.rating} initialNum={product.numReviews} />
                </>
            )}
        </div>
    );
};

export default ProductDetailPage;