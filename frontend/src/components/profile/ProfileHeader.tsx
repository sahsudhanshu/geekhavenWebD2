import { Edit } from "lucide-react";

interface userDetails {
    name: string;
    email: string;
    avatar: string;
    joinDate: string;
};

export const ProfileHeader = ({ user, onEdit }: { user: userDetails, onEdit?: () => void }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img className="h-24 w-24 rounded-full" src={user.avatar} alt="User avatar" />
        <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Member since: {new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
    <button onClick={onEdit} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-sky-400 bg-indigo-100 dark:bg-sky-900/50 rounded-md hover:bg-indigo-200 dark:hover:bg-sky-900">
            <Edit size={16} /> Edit Profile
        </button>
    </div>
);