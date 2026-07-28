import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, ChevronRight, Sparkles, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { brands, products, textures, type SkinTexture } from '../data/products'
import { useStore } from '../store/useStore'

const steps = ['Brand', 'Model', 'Texture'] as const

export function ProductDetail() {
  const { id } = useParams()
  const product = products.find((item) => item.id === id) ?? products[0]
  const [step, setStep] = useState(0)
  const [brand, setBrand] = useState(product.brand)
  const [model, setModel] = useState(product.compatibleModels[0])
  const [texture, setTexture] = useState<SkinTexture>(product.texture)
  const { addToCart, toggleCart } = useStore()

  const calculatedPrice = useMemo(() => {
    const base = product.price
    const premium = brand === 'Apple' ? 8 : brand === 'Dell' ? 6 : 4
    const textureFee = texture === 'Leather' ? 10 : texture === 'Anime' ? 7 : texture === 'Carbon Fiber' ? 5 : 0
    return base + premium + textureFee
  }, [brand, product.price, texture])

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          <Sparkles size={16} /> Customizer
        </div>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{product.name}</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">{product.description}</p>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-500">Preview</p>
            <div className="flex items-center gap-2">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="text-sm text-slate-600">{product.rating} ({product.reviews})</span>
            </div>
          </div>
          <div className={`rounded-[20px] bg-gradient-to-br ${product.accent} p-10 transition-all`} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {['3M Precision Cut', 'Bubble-free', 'Residue-free'].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <CheckCircle2 size={14} className="text-indigo-600 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500 mb-3">Available colors</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <span key={color} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{color}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Build your skin</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Choose your configuration</h2>
          </div>
          <div className="rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-700">${calculatedPrice}</div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button onClick={() => setStep(i)} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </button>
              <span className={`text-sm font-medium ${i === step ? 'text-slate-900' : 'text-slate-400'}`}>{s}</span>
              {i < steps.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {step === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Select brand</p>
              <div className="grid grid-cols-2 gap-2">
                {brands.map((option) => (
                  <button key={option} onClick={() => { setBrand(option); handleNext() }} className={`rounded-xl border p-3 text-sm font-medium transition-all ${brand === option ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Select model</p>
              <div className="space-y-2">
                {product.compatibleModels.map((option) => (
                  <button key={option} onClick={() => { setModel(option); handleNext() }} className={`w-full rounded-xl border p-3 text-left text-sm font-medium transition-all ${model === option ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Select texture</p>
              <div className="grid grid-cols-2 gap-2">
                {textures.map((option) => (
                  <button key={option} onClick={() => setTexture(option as SkinTexture)} className={`rounded-xl border p-3 text-sm font-medium transition-all ${texture === option ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}>
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="flex items-center gap-2"><CheckCircle2 className="text-indigo-600" size={16} /> Free shipping & 30-day peel-safe guarantee</div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => { addToCart(product, model); toggleCart(true) }} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md">
            Add to cart <ArrowRight size={16} />
          </button>
          <Link to="/checkout" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            Buy now
          </Link>
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-slate-600">
          <Star size={16} className="fill-amber-400 text-amber-400" /> {product.rating} · {product.reviews} reviews
        </div>
      </motion.div>
    </div>
  )
}
