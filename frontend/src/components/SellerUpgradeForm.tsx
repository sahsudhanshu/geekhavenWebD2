import React, { useState, useEffect } from 'react';
import API from '../services/useFetch';
import { useAuth } from '../context/authContext';

interface AddressInput {
  name: string;
  mobileNumber: string;
  address_line_1: string;
  address_line_2?: string;
  pincode: string;
  state: string;
  district: string;
}

const SellerUpgradeForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { token, userDetails, setUserDetails } = useAuth();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState<AddressInput>({
    name: '', mobileNumber: '', address_line_1: '', address_line_2: '', pincode: '', state: '', district: ''
  });
  const [useExisting, setUseExisting] = useState<string>('');
  const existingAddresses: any[] = (userDetails as any)?.addresses || [];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const updateField = (k: keyof AddressInput, v: string) => setAddress(a => ({ ...a, [k]: v }));

  useEffect(() => {
    if (useExisting) {
      const found = existingAddresses.find(a => a._id === useExisting);
      if (found) {
        setAddress({
          name: found.name || '',
          mobileNumber: found.mobileNumber || '',
          address_line_1: found.address_line_1 || '',
            address_line_2: found.address_line_2 || '',
          pincode: String(found.pincode || ''),
          state: found.state || '',
          district: found.district || ''
        });
      }
    }
  }, [useExisting]);

  const validate = () => {
    if (!/^\d{6}$/.test(address.pincode)) return 'Pincode must be 6 digits';
    if (!/^\+?\d{10,15}$/.test(phone)) return 'Phone must be 10-15 digits (optional leading +)';
    if (!/^\d{10,15}$/.test(address.mobileNumber)) return 'Confirm mobile must be 10-15 digits';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    const v = validate();
    if (v) { setError(v); return; }
    setLoading(true); setError(null);
    try {
      const body = { phone, address: { ...address, pincode: Number(address.pincode) } };
      const res = await API.post('/auth/self/upgrade-seller', body, token);
      if (res.status === 200) {
        // Re-validate to refresh userDetails
        try {
          const val = await API.post('/auth/validate', {}, token);
          if (val.status === 200) setUserDetails(val.data);
        } catch { /* ignore */ }
        setDone(true); onSuccess();
      }
    } catch (e: any) {
      setError(e.message || 'Failed');
    } finally { setLoading(false); }
  };

  if (done) return <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm">Seller upgrade submitted successfully.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-semibold mb-1">Become a Seller</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Provide your phone and a valid pickup address to enable listings.</p>
      </div>
      {existingAddresses.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Use Existing Address</label>
          <select value={useExisting} onChange={e => setUseExisting(e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm">
            <option value="">-- Select (or fill below) --</option>
            {existingAddresses.map(a => (
              <option key={a._id} value={a._id}>{a.name} · {a.pincode}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Phone *</label>
        <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
      </div>
      <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input value={address.name} onChange={e => updateField('name', e.target.value)} required className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Mobile (Confirm) *</label>
          <input value={address.mobileNumber} onChange={e => updateField('mobileNumber', e.target.value)} required className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
          <input value={address.address_line_1} onChange={e => updateField('address_line_1', e.target.value)} required className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Address Line 2</label>
          <input value={address.address_line_2} onChange={e => updateField('address_line_2', e.target.value)} className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pincode *</label>
          <input value={address.pincode} onChange={e => updateField('pincode', e.target.value)} required className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <input value={address.state} onChange={e => updateField('state', e.target.value)} required className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">District *</label>
          <input value={address.district} onChange={e => updateField('district', e.target.value)} required className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-3 py-2 text-sm" />
        </div>
      </fieldset>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end">
        <button disabled={loading} className="btn-accent px-5 py-2 rounded-md font-semibold text-white disabled:opacity-60">{loading ? 'Submitting...' : 'Upgrade to Seller'}</button>
      </div>
    </form>
  );
};

export default SellerUpgradeForm;
