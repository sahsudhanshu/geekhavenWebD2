export const AccountSettings = () => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manage Account</h3>
        <div className="space-y-4">
            <button className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">Change Password</button>
            <button className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">Notification Preferences</button>
            <button className="w-full text-left p-3 rounded-md text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50">Delete Account</button>
        </div>
    </div>
);