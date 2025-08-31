import { useEffect } from 'react';
import SellerUpgradeForm from '../components/SellerUpgradeForm';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

const SellerUpgradePage: React.FC = () => {
    const { userDetails, authReady } = useAuth() as any;
    const navigate = useNavigate();
    const isSeller = (userDetails?.role === 'seller') || (userDetails?.role === 'admin');

    useEffect(() => { if (authReady && isSeller) navigate('/seller/dashboard', { replace: true }); }, [authReady, isSeller]);

    if (!authReady) return <div className="p-8 text-center text-sm text-gray-500">Loading…</div>;
    if (isSeller) return null; 

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Become a Seller</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Provide the required details to start listing products.</p>
            <SellerUpgradeForm onSuccess={() => navigate('/seller/dashboard', { replace: true })} />
        </div>
    );
};

export default SellerUpgradePage;
