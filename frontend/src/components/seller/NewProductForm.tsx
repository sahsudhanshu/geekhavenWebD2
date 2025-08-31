import { useEffect, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import API from '../../services/useFetch';
import { useAuth } from '../../context/authContext';
import type { ProductItem, ImageObj } from './SellerProductList';

interface Props { onSuccess: (p: ProductItem) => void; editing?: ProductItem | null; onCancelEdit: () => void }

const NewProductForm: React.FC<Props> = ({ onSuccess, editing, onCancelEdit }) => {
    const { token } = useAuth();
    const [name, setName] = useState(editing?.name || '');
    const [description, setDescription] = useState(editing?.description || '');
    const [price, setPrice] = useState(editing ? String(editing.price) : '');
    const [category, setCategory] = useState(editing?.category || 'electronics');
    const [condition, setCondition] = useState(editing?.condition || 'New');
    const [usedCondition, setUsedCondition] = useState(editing?.usedCondition || 'Like New');
    const [stock, setStock] = useState(editing ? String(editing.stock) : '1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<ImageObj[]>(editing?.images || []);
    const maxImages = 6;

    const handleFiles = async (files: FileList | null) => {
        if (!files || !token) return;
        if (images.length >= maxImages) { setError(`Maximum ${maxImages} images reached`); return; }
        const accepted = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        const maxSize = 5 * 1024 * 1024;
        const fileArray = Array.from(files);
        const invalid = fileArray.filter(f => !accepted.includes(f.type) || f.size > maxSize);
        if (invalid.length) setError('Some files were rejected.');
        const valid = fileArray.filter(f => !invalid.includes(f));
        if (!valid.length) return;
        setUploading(true);
        try {
            const newImages: ImageObj[] = [];
            for (const file of valid) {
                if (images.length + newImages.length >= maxImages) break;
                const signRes = await fetch(import.meta.env.VITE_BACKEND_BASE_URL + '/upload/cloudinary/sign', {
                    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ folder: 'products' })
                });
                if (!signRes.ok) continue;
                const { timestamp, folder, signature, apiKey, cloudName } = await signRes.json();
                const formData = new FormData();
                formData.append('file', file);
                formData.append('api_key', apiKey);
                formData.append('timestamp', String(timestamp));
                formData.append('signature', signature);
                formData.append('folder', folder);
                const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
                const uploadRes = await fetch(cloudinaryUrl, { method: 'POST', body: formData });
                const uploadJson = await uploadRes.json();
                if (uploadRes.ok && uploadJson.secure_url) newImages.push({ url: uploadJson.secure_url, publicId: uploadJson.public_id });
            }
            if (newImages.length) setImages(prev => [...prev, ...newImages]);
        } catch { setError('Upload failed'); } finally { setUploading(false); }
    };

    useEffect(() => {
        if (editing) {
            setName(editing.name); setDescription(editing.description); setPrice(String(editing.price));
            setCategory(editing.category); setCondition(editing.condition); setUsedCondition(editing.usedCondition || 'Like New'); setStock(String(editing.stock)); setImages(editing.images || []);
        }
    }, [editing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!token) return; setLoading(true); setError(null);
        try {
            const body: any = { name, description, price: Number(price), category, condition, stock: Number(stock), images };
            if (condition === 'Used') body.usedCondition = usedCondition;
            const endpoint = editing ? `/products/${editing._id}` : '/products';
            const method = editing ? 'put' : 'post';
            // @ts-ignore
            const res = await API[method](endpoint, body, token);
            if (res.status === 200 || res.status === 201) {
                onSuccess(res.data);
                if (!editing) { setName(''); setDescription(''); setPrice(''); setCategory('electronics'); setCondition('New'); setUsedCondition('Like New'); setStock('1'); setImages([]); }
            } else setError(res.data?.message || 'Failed to save');
        } catch { setError('Request failed'); } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm relative">
            {editing && (
                <div className="absolute top-3 right-3 flex gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Editing</span>
                    <button type="button" onClick={onCancelEdit} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"><X size={16} /></button>
                </div>
            )}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Product Name</label>
                <input id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shadow-sm focus:border-accent-500 focus:ring-accent-500" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Description</label>
                <textarea id="description" rows={4} value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shadow-sm focus:border-accent-500 focus:ring-accent-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Price (₹)</label>
                    <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min={1} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shadow-sm focus:border-accent-500 focus:ring-accent-500" />
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Category</label>
                    <select id="category" value={category} onChange={e => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shadow-sm focus:border-accent-500 focus:ring-accent-500">
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="books">Books</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Condition</label>
                    <select id="condition" value={condition} onChange={e => setCondition(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shadow-sm focus:border-accent-500 focus:ring-accent-500">
                        <option>New</option>
                        <option>Refurbished</option>
                        <option>Used</option>
                    </select>
                </div>
                {condition === 'Used' && (
                    <div>
                        <label htmlFor="usedCondition" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Used Condition</label>
                        <select id="usedCondition" value={usedCondition} onChange={e => setUsedCondition(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shadow-sm focus:border-accent-500 focus:ring-accent-500">
                            <option>Like New</option>
                            <option>Good</option>
                            <option>Fair</option>
                        </select>
                    </div>
                )}
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Stock</label>
                    <input id="stock" type="number" min={1} value={stock} onChange={e => setStock(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 shadow-sm focus:border-accent-500 focus:ring-accent-500" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Product Images</label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 dark:border-slate-600 px-6 pt-5 pb-6">
                    <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-accent-600 dark:text-accent-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-800 hover:text-accent-500">
                                <span>Upload files</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={e => handleFiles(e.target.files)} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
            </div>
            {uploading && <p className="text-xs text-gray-500">Uploading...</p>}
            {images.length > 0 && (
                <div className="flex flex-wrap gap-3" onDragOver={e => e.preventDefault()}>
                    {images.map((img, idx) => (
                        <div key={img.url} className="h-20 w-20 relative group border rounded-md overflow-hidden" draggable onDragStart={e => e.dataTransfer.setData('text/plain', String(idx))} onDrop={e => {
                            e.preventDefault();
                            const from = Number(e.dataTransfer.getData('text/plain'));
                            if (from === idx) return;
                            setImages(list => {
                                const clone = [...list];
                                const [moved] = clone.splice(from, 1);
                                clone.splice(idx, 0, moved);
                                return clone;
                            });
                        }}>
                            <img src={img.url} className="h-full w-full object-cover" />
                            <div className="absolute top-0 left-0 right-0 p-1 flex justify-between opacity-0 group-hover:opacity-100 transition">
                                <span className="bg-black/50 text-white rounded px-1 text-[10px]">{idx + 1}</span>
                                <button type="button" onClick={async () => { if (editing && img.publicId) { try { await API.delete(`/products/${editing._id}/images/${img.publicId}`, token || undefined); } catch { } } setImages(prev => prev.filter(i => i.url !== img.url)); }} className="bg-black/60 text-white rounded px-1 text-[10px]">×</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <p className="text-xs text-gray-500">{images.length}/{maxImages} images</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3">
                {editing && <button type="button" onClick={onCancelEdit} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm">Cancel</button>}
                <button disabled={loading} type="submit" className="btn-accent px-5 py-2 rounded-md font-semibold text-white shadow-sm disabled:opacity-60">{loading ? (editing ? 'Saving...' : 'Listing...') : (editing ? 'Save Changes' : 'List Product')}</button>
            </div>
        </form>
    );
};

export default NewProductForm;