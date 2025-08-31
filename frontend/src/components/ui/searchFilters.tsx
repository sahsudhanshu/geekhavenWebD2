import { useNavigate, useSearchParams } from "react-router-dom"
import { useActionLog } from "../../hooks/useActionLog"
import { useState, useEffect } from "react"

export function SearchFilters() {
    const [sp] = useSearchParams()
    const navigate = useNavigate()
    const { push } = useActionLog()

    const [q, setQ] = useState(sp.get("q") || "")
    const [cat, setCat] = useState(sp.get("category") || "")
    const [min, setMin] = useState(sp.get("min") || "")
    const [max, setMax] = useState(sp.get("max") || "")

    useEffect(() => {
        setQ(sp.get("q") || "")
        setCat(sp.get("category") || "")
        setMin(sp.get("min") || "")
        setMax(sp.get("max") || "")
    }, [sp])

    function apply() {
        const params = new URLSearchParams()
        if (q) params.set("q", q)
        if (cat) params.set("category", cat)
        if (min) params.set("min", min)
        if (max) params.set("max", max)

        navigate(`/?${params.toString()}`, { replace: false }) // works like router.push
        push("search_apply", { q, category: cat, min, max })
    }

    return (
        <div className="w-full rounded-lg border p-3 grid grid-cols-1 md:grid-cols-5 gap-3">
            <input
                aria-label="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products"
                className="border rounded px-3 py-2 md:col-span-2"
            />
            <select
                aria-label="Category"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="border rounded px-3 py-2"
            >
                <option value="">All categories</option>
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home</option>
                <option>Books</option>
                <option>Sports</option>
            </select>
            <div className="flex items-center gap-2">
                <input
                    aria-label="Min price"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    placeholder="Min"
                    className="border rounded px-3 py-2 w-full"
                    inputMode="numeric"
                />
                <input
                    aria-label="Max price"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    placeholder="Max"
                    className="border rounded px-3 py-2 w-full"
                    inputMode="numeric"
                />
            </div>
            <button onClick={apply} className="bg-brand text-white rounded px-4 py-2">
                Apply
            </button>
        </div>
    )
}
