import React from 'react';
import clsx from 'clsx';

export const RatingStars: React.FC<{ rating: number; className?: string }> = ({ rating, className }) => {
    const r = Math.round(rating);
    return (
        <div className={clsx('flex items-center', className)}>
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={clsx('h-4 w-4', i < r ? 'text-amber-400' : 'text-gray-300 dark:text-gray-500')}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
                </svg>
            ))}
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{rating.toFixed(1)}</span>
        </div>
    );
};
