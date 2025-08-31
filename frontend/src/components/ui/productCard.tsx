import { Link } from "react-router-dom"
import { seededChecksum } from "./../../utils/seed"
import { useState, useEffect } from "react"
import { useActionLog } from "./../../hooks/useActionLog"

function useBookmarks() {
    const KEY = "bookmarks_v1"
    const [ids, setIds] = useState<string[]>([])
    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY)
            setIds(raw ? (JSON.parse(raw) as string[]) : [])
        } catch {
            setIds([])
        }
    }, [])
    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify(ids))
        } catch { }
    }, [ids])
    const toggle = (id: string) => {
        setIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        )
    }
    const has = (id: string) => ids.includes(id)
    return { ids, toggle, has }
}

export function ProductCard({ id, title, price, imageUrl, sellerId, }: { id: string; title: string; price: number; imageUrl?: string; sellerId: string }) {
    const [liked, setLiked] = useState(false)
    const { push } = useActionLog()
    const { has, toggle } = useBookmarks()
    const bookmarked = has(id)

    return (
        <div className="rounded-lg border border-gray-200 p-3 flex flex-col gap-3">
            <Link to={`/products/${id}`} className="group">
                <img
                    src={
                        imageUrl ||
                        `/placeholder.svg?height=200&width=300&query=product%20image%20placeholder`
                    }
                    alt={`${title} image`}
                    className="w-full h-40 object-cover rounded-md"
                />
                <div className="mt-2">
                    <h3 className="text-pretty font-semibold group-hover:text-brand transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {seededChecksum(id)}</p>
                    <p className="text-lg font-semibold mt-1">₹{price.toFixed(2)}</p>
                </div>
            </Link>
            <div className="flex items-center justify-between">
                <Link to={`/seller/${sellerId}`} className="text-sm text-accent hover:underline">
                    Seller profile
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        aria-pressed={liked}
                        onClick={() => {
                            setLiked((v) => !v)
                            push("like_toggle", { id })
                        }}
                        className={`px-2 py-1 rounded border ${liked ? "bg-brand text-white border-brand" : "border-gray-300"
                            }`}
                    >
                        {liked ? "Liked" : "Like"}
                    </button>
                    <button
                        aria-pressed={bookmarked}
                        onClick={() => {
                            toggle(id)
                            push("bookmark_toggle", { id })
                        }}
                        className={`px-2 py-1 rounded border ${bookmarked
                            ? "bg-accent text-white border-accent"
                            : "border-gray-300"
                            }`}
                    >
                        {bookmarked ? "Saved" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    )
}
