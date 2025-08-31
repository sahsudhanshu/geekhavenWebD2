import React from 'react';

interface ProductListHeaderProps {
    title: string;
    sortOrder: string;
    onChangeSort: (value: string) => void;
}

export const ProductListHeader: React.FC<ProductListHeaderProps> = ({ title, sortOrder, onChangeSort }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <select
                        value={sortOrder}
                        onChange={(e) => onChangeSort(e.target.value)}
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
    );
};
