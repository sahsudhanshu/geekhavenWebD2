import { useState } from 'react';
import { Package, Settings } from 'lucide-react';
import clsx from 'clsx';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { OrderHistory } from '../components/profile/orderHistory';
import { useAuth } from '../context/authContext';
import { AccountSettings } from '../components/profile/AccountSettings';
import ProfileEditModal from '../components/profile/ProfileEditModal';

interface UserDetailsShape {
    name?: string;
    email?: string;
    avatar?: string;
    createdAt?: string;
}

const UserProfilePage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const { userDetails } = useAuth();
    const u = (userDetails as UserDetailsShape) || {};
    const [showEdit, setShowEdit] = useState(false);

    const tabs = [
        { id: 'orders', name: 'Order History', icon: <Package size={18} /> },
        { id: 'settings', name: 'Account Settings', icon: <Settings size={18} /> },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
            <ProfileHeader onEdit={() => setShowEdit(true)} user={{
                name: u.name || 'NA',
                email: u.email || 'NA',
                avatar: u.avatar || '',
                joinDate: u.createdAt || 'NA',
            }} />

            <div className="mt-8">
                <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    'flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium',
                                    activeTab === tab.id
                                        ? 'border-indigo-500 dark:border-sky-400 text-indigo-600 dark:text-sky-400'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-600 hover:text-gray-700 dark:hover:text-gray-200'
                                )}
                            >
                                {tab.icon} {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div>
                    {activeTab === 'orders' && <OrderHistory />}
                    {activeTab === 'settings' && <AccountSettings />}
                </div>
            </div>
            <ProfileEditModal open={showEdit} onClose={() => setShowEdit(false)} initial={{ name: u.name, email: u.email, avatar: u.avatar }} />
        </div>
    );
};

export default UserProfilePage;