import React from 'react';
import { ProductCard } from './productCard';
import { RatingStars } from './RatingStars';

interface ProductGridProps {
    products: any[];
    loading: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, loading }) => {
    if (loading) return <p className="text-center text-gray-500">Loading...</p>;
    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p: any) => (
                    <div key={p._id || p.id} className="group relative bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <ProductCard
                            id={p._id || p.id}
                            title={p.name || p.title}
                            price={p.price}
                            imageUrl={p.images?.[0]?.url || p.images?.[0]}
                            sellerId={p.seller?._id || p.sellerId}
                        />
                        <div className="px-4 pb-4">
                            <RatingStars rating={p.rating} />
                        </div>
                    </div>
                ))}
            </div>
            {products.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-slate-800 rounded-lg mt-6">
                    <h2 className="text-xl font-medium text-gray-700 dark:text-gray-200">No products found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or check back later!</p>
                </div>
            )}
        </>
    );
};
