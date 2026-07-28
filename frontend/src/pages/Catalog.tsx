import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Filter, SlidersHorizontal, Star } from 'lucide-react'
import { brands, categories, products, textures } from '../data/products'
import { useStore } from '../store/useStore'

export function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All')
  const [selectedBrand, setSelectedBrand] = useState('All')
  const [selectedTexture, setSelectedTexture] = useState('All')
  const [sortBy, setSortBy] = useState('popular')
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({})
  const { addToCart, toggleCart, searchQuery } = useStore()

  const filteredProducts = useMemo(() => {
    let nextProducts = products.filter((product) => {
      const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory
      const brandMatch = selectedBrand === 'All' || product.brand === selectedBrand
      const textureMatch = selectedTexture === 'All' || product.texture === selectedTexture
      const searchMatch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase()) || product.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return categoryMatch && brandMatch && textureMatch && searchMatch
    })

    return nextProducts.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'newest') return b.reviews - a.reviews
      return b.rating - a.rating
    })
  }, [selectedBrand, selectedCategory, selectedTexture, sortBy, searchQuery])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Catalog</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {searchQuery ? `Results for "${searchQuery}"` : 'Curated skins for premium devices'}
            </h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <SlidersHorizontal size={16} /> {filteredProducts.length} design{filteredProducts.length !== 1 ? 's' : ''} available
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2"><Filter size={16} /> Device category</span>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSearchParams(e.target.value === 'All' ? {} : { category: e.target.value }) }} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300">
              <option value="All">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Brand</span>
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300">
              <option value="All">All brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Texture</span>
            <select value={selectedTexture} onChange={(e) => setSelectedTexture(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300">
              <option value="All">All textures</option>
              {textures.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Sort</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300">
              <option value="popular">Popularity</option>
              <option value="price">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>
      </motion.div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-[24px] border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">No skins found</p>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="group rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className={`rounded-[20px] bg-gradient-to-br ${product.accent} p-6`} />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">{product.badge}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                </div>
                <div className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">${product.price}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">{product.description}</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Star size={16} className="fill-amber-400 text-amber-400" /> {product.rating} · {product.reviews} reviews
              </div>
              <div className="mt-4 flex items-center gap-2">
                <select
                  value={selectedModels[product.id] || product.compatibleModels[0]}
                  onChange={(e) => setSelectedModels((prev) => ({ ...prev, [product.id]: e.target.value }))}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-300"
                >
                  {product.compatibleModels.map((m) => <option key={m}>{m}</option>)}
                </select>
                <button onClick={() => { addToCart(product, selectedModels[product.id] || product.compatibleModels[0]); toggleCart(true) }} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Add</button>
              </div>
              <Link to={`/product/${product.id}`} className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700">View customizer</Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
