import React from 'react';
import { useLoaderData } from 'react-router-dom';
import type { Product } from '../types/product';
import ProductCard from '../components/ProductCard'; // <-- IMPORT
import styles from './ProductListPage.module.css';        // <-- IMPORT

// The loader function remains the same, we just update the component
export const productListLoader = async (): Promise<Product[]> => {
    // Fetching from your own backend now
    const response = await fetch('http://localhost:8000/api/products');
    if (!response.ok) {
        throw new Response('Failed to fetch products', { status: 500 });
    }
    return response.json();
};

const ProductListPage: React.FC = () => {
    const products = useLoaderData() as Product[];

    return (
        <div>
            <h1 className={styles.pageTitle}>Explore Products</h1>
            <div className={styles.productGrid}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductListPage;