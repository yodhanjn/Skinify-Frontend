import { ArrowRight, CheckCircle2, Palette, Ruler, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { products } from '../data/products'
import { useStore } from '../store/useStore'

const highlights = [
  { icon: Ruler, title: '3M Precision Cut', description: 'Factory-grade accuracy with laser-cut edges that follow every curve of your device.' },
  { icon: Zap, title: 'Bubble-free', description: 'Advanced air-release adhesive for a clean, wrinkle-free finish every time.' },
  { icon: ShieldCheck, title: 'Matte Finish', description: 'A soft, velvety grip that resists fingerprints and feels premium to the touch.' },
  { icon: Palette, title: 'Residue-free', description: 'Removes cleanly without sticky residue, so you can switch styles anytime.' },
]

const reviews = [
  { name: 'Sarah K.', role: 'Designer', text: 'The finish feels premium, and the fit is flawless. It transformed my MacBook setup without any bulk.' },
  { name: 'James L.', role: 'Gamer', text: 'Applied the carbon fiber skin to my PS5 in minutes. Looks incredible and the texture is unreal.' },
  { name: 'Mia R.', role: 'Photographer', text: 'Switched from a case to a Skinify skin on my iPhone. Lighter, better looking, and still protected.' },
]

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }

export function Home() {
  const { addToCart, toggleCart } = useStore()

  return (
    <div className="space-y-8">
      <motion.section {...fadeUp} transition={{ duration: 0.5 }} className="grid items-center gap-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">
            <Sparkles size={14} /> Premium device skins, reimagined
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Make every device feel custom, premium, and unmistakably yours.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Precision-cut skins for laptops, phones, and consoles that blend protection, tactile feel, and elevated design.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/catalog" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md">
              Shop bestsellers <ArrowRight size={16} />
            </Link>
            <Link to="/product/aurora-macbook" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
              Explore customizer
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2"><CheckCircle2 className="text-indigo-600" size={16} /> Free shipping over $60</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="text-indigo-600" size={16} /> 30-day warranty</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="text-indigo-600" size={16} /> Easy returns</div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-inner">
          <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-slate-100 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Live preview</p>
                <p className="text-xl font-semibold text-slate-900">MacBook Air</p>
              </div>
              <div className="rounded-full bg-indigo-600 px-3 py-1 text-sm font-semibold text-white">New</div>
            </div>
            <div className="rounded-[24px] bg-slate-900 p-8 text-white shadow-xl">
              <div className="mx-auto h-40 w-56 rounded-[20px] border border-white/10 bg-gradient-to-br from-indigo-500 via-indigo-400 to-slate-200" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Starting at</p>
                <p className="text-2xl font-semibold text-slate-900">$49</p>
              </div>
              <button onClick={() => { addToCart(products[0], 'MacBook Air M2'); toggleCart(true) }} className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">
                Add to cart
              </button>
            </div>
          </div>
        </motion.div>
      </motion.section>

      <div className="grid gap-4 md:grid-cols-3">
        {(['Laptops', 'Mobiles', 'Consoles'] as const).map((category, i) => (
          <motion.div key={category} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{category}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Tailored skins for {category.toLowerCase()}</h3>
            <Link to={`/catalog?category=${category}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
              Shop now <ArrowRight size={16} />
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.section {...fadeUp} transition={{ delay: 0.3 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Why Skinify</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Made for premium daily use</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-all hover:bg-white hover:shadow-sm">
              <div className="rounded-xl bg-indigo-100 p-2.5 text-indigo-600 inline-flex">
                <item.icon size={18} />
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeUp} transition={{ delay: 0.4 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Bestsellers</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Loved by creators and gamers</h2>
          </div>
          <Link to="/catalog" className="text-sm font-semibold text-indigo-600">View catalog</Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="group rounded-2xl border border-slate-200 p-5 transition-all hover:shadow-md">
              <div className={`rounded-[20px] bg-gradient-to-br ${product.accent} p-6`} />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">{product.badge}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
                </div>
                <div className="rounded-full bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">${product.price}</div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Star size={16} className="fill-amber-400 text-amber-400" /> {product.rating} · {product.reviews} reviews
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Link to={`/product/${product.id}`} className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">View details</Link>
                <button onClick={() => { addToCart(product); toggleCart(true) }} className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Add</button>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...fadeUp} transition={{ delay: 0.5 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Customer Reviews</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Trusted by thousands</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <div key={review.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-sm leading-6 text-slate-600">"{review.text}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600">{review.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
