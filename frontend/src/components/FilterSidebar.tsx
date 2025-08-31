import React from 'react';
import clsx from 'clsx';

interface FilterSidebarProps {
    categories: string[];
    activeCategory: string;
    maxPriceObserved: number;
    maxParam?: number;
    minRatingParam: number;
    onChangeCategory: (cat: string | null) => void;
    onChangeMax: (price: number | null) => void;
    onChangeMinRating: (rating: number | null) => void;
    onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, activeCategory, maxPriceObserved, maxParam, minRatingParam, onChangeCategory, onChangeMax, onChangeMinRating, onReset
}) => {
    const effectiveValue = typeof maxParam === 'number' ? maxParam : maxPriceObserved;
    return (
        <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20 space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Categories</h3>
                    <div className="space-y-1">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => onChangeCategory(cat === 'all' ? null : cat)}
                                className={clsx(
                                    'w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors',
                                    activeCategory === cat || (cat === 'all' && activeCategory === 'all')
                                        ? 'bg-indigo-100 dark:bg-sky-900/50 text-indigo-700 dark:text-sky-300'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                )}
                            >
                                {cat === 'all' ? 'All Products' : cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Price (max)</h3>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="maxPrice" className="text-sm text-gray-600 dark:text-gray-300">
                            {maxParam ? `Up to ₹${effectiveValue.toLocaleString()}` : `Any price (max ₹${maxPriceObserved.toLocaleString()})`}
                        </label>
                        <input
                            id="maxPrice"
                            type="range"
                            min={0}
                            max={maxPriceObserved}
                            step={Math.ceil(maxPriceObserved / 50) || 100}
                            value={effectiveValue}
                            onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val >= maxPriceObserved) onChangeMax(null); else onChangeMax(val);
                            }}
                            className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-sky-500"
                        />
                        <button
                            onClick={() => onChangeMax(null)}
                            className="text-xs text-gray-500 hover:underline self-start"
                        >
                            Clear max
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Minimum Rating</h3>
                    <div className="flex space-x-1">
                        {[0, 3, 4].map((r) => (
                            <button
                                key={r}
                                onClick={() => onChangeMinRating(r === 0 ? null : r)}
                                className={clsx(
                                    'flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors',
                                    (minRatingParam || 0) === r
                                        ? 'bg-amber-400 text-white'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                )}
                            >
                                {r === 0 ? 'Any' : `${r}+`}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={onReset}
                    className="w-full text-sm text-center text-gray-600 dark:text-gray-300 hover:underline"
                >
                    Reset Filters
                </button>
            </div>
        </aside>
    );
};
