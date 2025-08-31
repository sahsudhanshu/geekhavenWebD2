import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import type { Product } from '../types/product.d.ts';

export const productListLoader = async (): Promise<Product[]> => {
    console.log('Fetching product list...');
    const response = await fetch('https://fakestoreapi.com/products');

    if (!response.ok) {
        throw new Response('Failed to fetch products.', { status: 500 });
    }

    const data = await response.json();
    console.log('Fetch complete.');
    return data;
};


const ProductListPage: React.FC = () => {
    const products = useLoaderData() as Product[];

    return (
        <div>
            <h1>Our Products</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                {products.map((product) => (
                    <div key={product.id} style={{ border: '1px solid #ddd', padding: '1rem' }}>
                        <img src={product.image} alt={product.title} style={{ width: '100%', height: '150px', objectFit: 'contain' }} />
                        <h3 style={{ fontSize: '1rem', height: '3em' }}>{product.title}</h3>
                        <p style={{ fontWeight: 'bold' }}>${product.price}</p>
                        {/* You would eventually link to a product detail page */}
                        {/* <Link to={`/product/${product.id}`}>View Details</Link> */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductListPage;