import { useState } from 'react';
import { useAuth } from '../../context/authContext';

interface Props {
  open: boolean;
  onClose: () => void;
  initial: { name?: string; email?: string; avatar?: string; contactNumber?: string };
  onUpdated?: (u: any) => void;
}

export const ProfileEditModal = ({ open, onClose, initial, onUpdated }: Props) => {
  const { token, setUserDetails, userDetails } = useAuth();
  const [name, setName] = useState(initial.name || '');
  const [contactNumber, setContactNumber] = useState(initial.contactNumber || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(initial.avatar);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      if (name) form.append('name', name);
      if (contactNumber) form.append('contactNumber', contactNumber);
      if (avatarFile) form.append('avatar', avatarFile);
      const res = await fetch(import.meta.env.VITE_BACKEND_BASE_URL + '/user/profile', {
        method: 'PUT',
        headers: { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` },
        body: form
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Update failed');
      setUserDetails?.({ ...(userDetails || {}), ...data.user, avatar: data.user?.avatar?.url });
      onUpdated?.(data.user);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
        <form onSubmit={submit} className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Edit Profile</h2>
          {error && <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-2 rounded">{error}</div>}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-sky-500" />
          </div>
            <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Contact Number</label>
            <input value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="w-full rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-sky-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Avatar</label>
            {preview && <img src={preview} className="h-20 w-20 rounded-full object-cover" />}
            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setAvatarFile(f); setPreview(URL.createObjectURL(f)); } }} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300">Cancel</button>
            <button disabled={loading} type="submit" className="px-4 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 dark:bg-sky-600 dark:hover:bg-sky-500 text-white disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;