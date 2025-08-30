import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export const ThemeButton = () => {
    const [theme, toggleTheme] = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            aria-label="Toggle theme">
            {theme === 'light' ? (<Moon className="h-6 w-6" />) : (<Sun className="h-6 w-6" />)}
        </button >
    );
};