import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Watch, BookOpen, Car, Home, Shirt, Disc, } from 'lucide-react';

const categories = [
    { name: 'Electronics', icon: <Smartphone size={20} />, slug: 'electronics' },
    { name: 'Computers', icon: <Laptop size={20} />, slug: 'computers' },
    { name: 'Fashion', icon: <Shirt size={20} />, slug: 'fashion' },
    { name: 'Books', icon: <BookOpen size={20} />, slug: 'books' },
    { name: 'Vehicles', icon: <Car size={20} />, slug: 'vehicles' },
    { name: 'Home & Garden', icon: <Home size={20} />, slug: 'home-garden' },
    { name: 'Collectibles', icon: <Disc size={20} />, slug: 'collectibles' },
    { name: 'Watches', icon: <Watch size={20} />, slug: 'watches' },
];

const CategoriesBar = () => {
    return (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm sticky top-16 z-30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Horizontal scroll container */}
                <div className="flex items-center space-x-4 overflow-x-auto py-2 scrollbar-hide">
                    {categories.map((category) => (
                        <Link
                            key={category.slug}
                            to={`/category/${category.slug}`}
                            className="flex items-center gap-2 flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-sky-500"
                        >
                            {category.icon}
                            <span>{category.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};
export { CategoriesBar };
