import React from 'react';
import clsx from 'clsx';

interface FilterSidebarProps {
    categories: string[];
    activeCategory: string;
    minParam?: number;
    maxParam?: number;
    minRatingParam: number;
    onChangeCategory: (cat: string | null) => void;
    onChangeMin: (price: number | null) => void;
    onChangeMax: (price: number | null) => void;
    onChangeMinRating: (rating: number | null) => void;
    onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ categories, activeCategory, minParam, maxParam, minRatingParam, onChangeCategory, onChangeMin, onChangeMax, onChangeMinRating, onReset }) => {
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
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Price Range</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300 mb-1">Min (₹)</label>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Min"
                                    value={typeof minParam === 'number' ? minParam : ''}
                                    onChange={(e) => {
                                        const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
                                        onChangeMin(val === null ? null : (isNaN(val) ? null : val));
                                    }}
                                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-sky-500"
                                />
                            </div>
                            <div className="w-4 text-center text-gray-400">–</div>
                            <div className="flex-1">
                                <label className="block text-[11px] font-medium text-gray-600 dark:text-gray-300 mb-1">Max (₹)</label>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Max"
                                    value={typeof maxParam === 'number' ? maxParam : ''}
                                    onChange={(e) => {
                                        const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
                                        onChangeMax(val === null ? null : (isNaN(val) ? null : val));
                                    }}
                                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-sky-500"
                                />
                            </div>
                        </div>
                        {(typeof minParam === 'number' || typeof maxParam === 'number') && (
                            <button
                                onClick={() => { onChangeMin(null); onChangeMax(null); }}
                                className="text-xs text-indigo-600 dark:text-sky-400 hover:underline"
                            >
                                Clear price range
                            </button>
                        )}
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
