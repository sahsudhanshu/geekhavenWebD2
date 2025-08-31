import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import API from '../services/useFetch'
import { ProductCard } from '../components/home/productCard'
import { useActionLog } from '../hooks/useActionLog'
import { seededChecksum } from '../utils/seed'

interface SellerProfile { _id:string; name:string; avatar?:{url?:string}; rating?:number; numReviews?:number }
interface Product { _id:string; name:string; price:number; images?:{url:string}[]; seller:string; likesCount?:number; liked?:boolean; bookmarked?:boolean; likes?:any[] }
interface Review { _id:string; user:{name:string}; rating:number; comment:string; createdAt:string }

export default function SellerProfilePage(){
  const { id } = useParams<{id:string}>()
  const { push } = useActionLog()
  const [loading,setLoading]=useState(true)
  const [products,setProducts]=useState<Product[]>([])
  const [seller,setSeller]=useState<SellerProfile|null>(null)
  const [reviews,setReviews]=useState<Review[]>([])
  const [error,setError]=useState<string|null>(null)

  useEffect(()=>{ if(!id) return; let alive=true; (async()=>{ setLoading(true); setError(null); try {
      const prodRes = await API.get(`/products?q=&limit=50&seller=${id}`)
      if(alive) setProducts(prodRes.data.items||[])
      const detailSeller = prodRes.data.items?.[0]?.seller?.name ? prodRes.data.items[0].seller : null
      if(alive && detailSeller) setSeller(detailSeller)
      const firstProd = prodRes.data.items?.[0]?._id
      if(firstProd){ try { const revRes = await API.get(`/products/${firstProd}/reviews`); if(alive) setReviews(revRes.data.reviews||[]) } catch {} }
      push('seller_profile_view',{ id })
    } catch(e:any){ if(alive) setError(e.message||'Load failed') } finally { if(alive) setLoading(false) } })(); return ()=>{alive=false}
  },[id])

  const avgRating = useMemo(()=>{ if(!reviews.length) return 0; return +(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(2)},[reviews])

  if(loading) return <div className="p-10 text-sm text-gray-500">Loading seller...</div>
  if(error) return <div className="p-10 text-sm text-red-600">{error}</div>
  return <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
    <header className="flex flex-col md:flex-row gap-6 items-start md:items-center">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[var(--seed-accent-subtle)] flex items-center justify-center text-[var(--seed-accent)] font-bold text-xl">{(seller?.name||'U').slice(0,1)}</div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{seller?.name||'Seller'}</h1>
          <p className="text-xs text-gray-500">Seller ID: {seededChecksum(id||'')}</p>
          <p className="text-sm mt-1">Rating {avgRating} ({reviews.length} reviews)</p>
        </div>
      </div>
    </header>
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Listings</h2>
      {products.length===0 && <p className="text-sm text-gray-500">No products yet.</p>}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{products.map(p=> <ProductCard key={p._id} id={p._id} title={p.name} price={p.price} imageUrl={p.images?.[0]?.url} sellerId={p.seller} likesCount={p.likesCount} liked={p.liked} bookmarked={p.bookmarked} likes={p.likes} />)}</div>
    </section>
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Sample Product Reviews</h2>
      <div className="space-y-3">
        {reviews.slice(0,5).map(r=> <div key={r._id} className="p-3 rounded-lg border bg-white/70 dark:bg-slate-800/70"><p className="text-sm font-medium">{r.user?.name||'User'} <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span></p><p className="text-xs text-gray-600 mt-1">Rating {r.rating}</p><p className="text-sm mt-1">{r.comment}</p></div>)}
        {reviews.length===0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
      </div>
    </section>
    <div className="text-xs text-gray-500">Aggregated from first product for brevity.</div>
  </div>
}