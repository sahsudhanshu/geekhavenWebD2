import { useEffect, useState } from "react"
const KEY = "theme_pref_v1"
export function ThemeToggle() {
    const [dark, setDark] = useState(false)
    useEffect(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem(KEY) : null
        const isDark = saved ? saved === "dark" : false
        setDark(isDark)
        if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", isDark)
        }
    }, [])
    function toggle() {
        const next = !dark
        setDark(next)
        if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next)
            localStorage.setItem(KEY, next ? "dark" : "light")
        }
    }
    return (
        <button
            onClick={toggle}
            className="px-3 py-1 rounded border border-gray-300 text-sm"
            aria-pressed={dark}
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
        >
            {dark ? "Light" : "Dark"}
        </button>
    )
}
