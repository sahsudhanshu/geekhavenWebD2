import React, { useState } from 'react';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router-dom';
import styles from '../layout/ProductDetailPage.module.css';
import api from '../services/useFetch'; // Our Axios instance
import { useAuth } from '../context/authContext';
import ChecksumBadge from './ChecksumBadge';

// 1. THE LOADER (uses env base URL and backend product schema)
export const productDetailLoader = async ({ params }: LoaderFunctionArgs): Promise<any> => {
    const { id } = params;
    if (!id) throw new Response('Product ID not found', { status: 400 });
    const base = import.meta.env.VITE_BACKEND_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000/api/v1';
    const res = await fetch(`${base}/products/${id}`, { headers: { Accept: 'application/json' } });
    if (res.status === 404) throw new Response('Product not found', { status: 404 });
    if (!res.ok) throw new Response('Failed to load product', { status: 500 });
    return res.json();
};


// 2. THE COMPONENT
const ProductDetailPage: React.FC = () => {
    const product: any = useLoaderData();
    const { token } = useAuth();
    const [successMessage, setSuccessMessage] = useState('');

    const handleAddToCart = async () => {
        if (!token) {
            alert('Please log in to add items to your cart.');
            // You could also navigate to login page here
            return;
        }

        try {
            const prodId = product._id || product.id;
            await api.post(`/cart/${prodId}`, { quantity: 1 }, token);
            setSuccessMessage('Product added to cart!');
            setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
        } catch (error) {
            console.error('Failed to add to cart', error);
            alert('Failed to add item to cart.');
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.productLayout}>
                <div className={styles.imageContainer}>
                    <img src={(product.images && product.images[0]?.url) || product.image || 'https://via.placeholder.com/400'} alt={product.name || product.title} className={styles.productImage} />
                </div>
                <div className={styles.detailsContainer}>
                    <div className="flex items-center gap-2">
                        <p className={styles.category}>{product.category}</p>
                        <ChecksumBadge id={product._id || product.id} />
                    </div>
                    <h1>{product.name || product.title}</h1>
                    <p className={styles.condition}>Condition: <strong>{product.condition || 'N/A'}</strong></p>
                    <p className={styles.price}>₹{Number(product.price || 0).toLocaleString()}</p>
                    <button className={`btn-accent ${styles.addToCartButton}`} onClick={handleAddToCart}>
                        Add to Cart
                    </button>
                    {successMessage && <p className={styles.successMessage}>{successMessage}</p>}
                    <p className={styles.description}>{product.description}</p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;