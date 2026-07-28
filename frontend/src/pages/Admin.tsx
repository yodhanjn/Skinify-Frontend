import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Package, Plus, ShoppingBag, TrendingUp, Users, X } from 'lucide-react'
import { products as initialProducts } from '../data/products'
import type { DeviceCategory, Product, SkinTexture } from '../types'

const metrics = [
  { label: 'Total Revenue', value: '$12,426', icon: DollarSign, change: '+12.5%' },
  { label: 'Total Orders', value: '348', icon: ShoppingBag, change: '+8.2%' },
  { label: 'Active Products', value: '24', icon: Package, change: '+3' },
  { label: 'Customers', value: '1,247', icon: Users, change: '+15.3%' },
]

const recentOrders = [
  { id: '#10341', customer: 'Sarah K.', item: 'Aurora Matte for MacBook', status: 'Shipped', total: 57, date: '2026-07-26' },
  { id: '#10340', customer: 'James L.', item: 'Nova Leather for PlayStation', status: 'Processing', total: 64, date: '2026-07-25' },
  { id: '#10339', customer: 'Mia R.', item: 'Velocity Carbon for iPhone', status: 'Delivered', total: 47, date: '2026-07-24' },
  { id: '#10338', customer: 'Alex M.', item: 'Zen Minimal for Xbox', status: 'Processing', total: 52, date: '2026-07-24' },
  { id: '#10337', customer: 'Chris D.', item: 'Lumen Matte for Samsung', status: 'Delivered', total: 45, date: '2026-07-23' },
]

export function Admin() {
  const [adminProducts, setAdminProducts] = useState<Product[]>(initialProducts)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState<{ name: string; category: DeviceCategory; brand: string; texture: SkinTexture; price: number; description: string; stock: number }>({ name: '', category: 'Laptops', brand: 'Apple', texture: 'Matte', price: 49, description: '', stock: 100 })

  const handleSave = () => {
    if (editingProduct) {
      setAdminProducts((prev) => prev.map((p) => p.id === editingProduct.id ? { ...p, ...form } : p))
    } else {
      const newProduct: Product = {
        id: `product-${Date.now()}`,
        name: form.name,
        category: form.category,
        brand: form.brand,
        texture: form.texture,
        price: form.price,
        originalPrice: form.price + 20,
        rating: 0,
        reviews: 0,
        badge: 'New',
        description: form.description,
        tags: [form.texture],
        colors: ['Default'],
        compatibleModels: ['Model 1'],
        accent: 'from-indigo-500 to-violet-500',
        stock: form.stock,
      }
      setAdminProducts((prev) => [...prev, newProduct])
    }
    setShowModal(false)
    setEditingProduct(null)
    setForm({ name: '', category: 'Laptops', brand: 'Apple', texture: 'Matte', price: 49, description: '', stock: 100 })
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setForm({ name: product.name, category: product.category, brand: product.brand, texture: product.texture, price: product.price, description: product.description, stock: product.stock || 100 })
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    setAdminProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const statusColor = (status: string) => {
    if (status === 'Delivered') return 'bg-green-50 text-green-700'
    if (status === 'Shipped') return 'bg-blue-50 text-blue-700'
    return 'bg-amber-50 text-amber-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Admin Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Store Overview</h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600"><m.icon size={18} /></div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600"><TrendingUp size={12} /> {m.change}</span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-slate-900">{m.value}</p>
            <p className="mt-1 text-sm text-slate-500">{m.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Last 7 days</span>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{order.id} · {order.customer}</p>
                  <p className="text-xs text-slate-500 truncate">{order.item}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor(order.status)}`}>{order.status}</span>
                  <span className="text-sm font-semibold text-slate-900">${order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Inventory</h2>
            <button onClick={() => { setEditingProduct(null); setForm({ name: '', category: 'Laptops', brand: 'Apple', texture: 'Matte', price: 49, description: '', stock: 100 }); setShowModal(true) }} className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700">
              <Plus size={12} /> Add product
            </button>
          </div>
          <div className="space-y-2">
            {adminProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br ${product.accent}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.brand} · {product.texture}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">${product.price}</span>
                  <button onClick={() => handleEdit(product)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Del</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1 text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Product name</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DeviceCategory })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none">
                    <option>Laptops</option><option>Mobiles</option><option>Consoles</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Brand</span>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Texture</span>
                  <select value={form.texture} onChange={(e) => setForm({ ...form, texture: e.target.value as SkinTexture })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none">
                    <option>Matte</option><option>Carbon Fiber</option><option>Leather</option><option>Anime</option><option>Minimal</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  <span className="mb-2 block">Price ($)</span>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
                </label>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Description</span>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Stock</span>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">Cancel</button>
              <button onClick={handleSave} className="flex-1 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">{editingProduct ? 'Save changes' : 'Add product'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
