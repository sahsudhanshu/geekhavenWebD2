import { Edit, Trash2 } from 'lucide-react';
import React from 'react';

export interface ImageObj { url: string; publicId?: string }
export interface ProductItem {
  _id: string; name: string; description: string; price: number; category: string; condition: string; usedCondition?: string; images: ImageObj[]; status: string; stock: number;
}
export interface Paged<T> { items: T[]; page: number; pages: number; total: number }

interface Props { data: Paged<ProductItem> | null; loading: boolean; onEdit: (p: ProductItem) => void; onDelete: (id: string) => void; onPage: (page: number) => void }

const SellerProductList: React.FC<Props> = ({ data, loading, onEdit, onDelete, onPage }) => {
  const products = data?.items || [];
  if (loading) return <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading products...</div>;
  if (!products.length) return <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">No listings yet.</div>;
  return (
    <div className="bg-white dark:bg-slate-800 shadow-sm sm:rounded-lg overflow-hidden">
      <ul role="list" className="divide-y divide-gray-200 dark:divide-slate-700">
        {products.map(product => (
          <li key={product._id}>
            <div className="px-4 py-4 sm:px-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
                {product.images?.length ? <img className="h-12 w-12 rounded-md object-cover" src={product.images[0].url} alt={product.name} /> : 'IMG'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-accent-600 dark:text-accent-400 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">₹{product.price.toLocaleString()} · {product.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(product)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"><Edit size={18} /></button>
                <button onClick={() => onDelete(product._id)} className="p-2 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50"><Trash2 size={18} /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-slate-700 text-sm">
          <span className="text-gray-500 dark:text-gray-400">Page {data.page} of {data.pages}</span>
          <div className="flex gap-2">
            <button disabled={data.page === 1} onClick={() => onPage(data.page - 1)} className="px-3 py-1 rounded-md border text-gray-600 dark:text-gray-300 disabled:opacity-40">Prev</button>
            <button disabled={data.page === data.pages} onClick={() => onPage(data.page + 1)} className="px-3 py-1 rounded-md border text-gray-600 dark:text-gray-300 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProductList;