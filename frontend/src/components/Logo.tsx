import { Link } from "react-router-dom";

export const Logo = () => (
    <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-indigo-600 dark:text-sky-500"
        >
            <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM12 22.182v-9l-9-5.25v8.57a.75.75 0 00.372.648L12 22.182z" />
        </svg>
        <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">ReSell.com</span>
    </Link>
);