import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Minus, Plus, Tag, Trash2, ShoppingBag } from 'lucide-react'
import { useStore } from '../store/useStore'

export function CartDrawer() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, promoCode, promoDiscount, applyPromo, removePromo } = useStore()
  const [promoInput, setPromoInput] = useState('')
  const [promoError, setPromoError] = useState('')
  const navigate = useNavigate()

  if (!isCartOpen) return null

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = subtotal * promoDiscount
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + tax

  const handleApplyPromo = () => {
    applyPromo(promoInput)
    const upper = promoInput.toUpperCase().trim()
    if (['SKINIFY20', 'WELCOME10', 'PREMIUM15'].includes(upper)) {
      setPromoError('')
      setPromoInput('')
    } else {
      setPromoError('Invalid promo code')
    }
  }

  const handleCheckout = () => {
    toggleCart(false)
    navigate('/checkout')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm"
        onClick={() => toggleCart(false)}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Your Cart</p>
              <h2 className="text-lg font-semibold text-slate-900">{cart.length} item{cart.length !== 1 ? 's' : ''}</h2>
            </div>
            <button onClick={() => toggleCart(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-2xl bg-slate-100 p-4">
                  <ShoppingBag size={32} className="text-slate-400" />
                </div>
                <p className="mt-4 text-sm font-medium text-slate-900">Your cart is empty</p>
                <p className="mt-1 text-sm text-slate-500">Add a premium skin to get started.</p>
                <button onClick={() => { toggleCart(false); navigate('/catalog') }} className="mt-4 rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">Browse Catalog</button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.selectedModel}`}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-16 w-16 flex-shrink-0 rounded-xl bg-gradient-to-br ${item.accent}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.selectedModel}</p>
                        <p className="text-xs text-slate-400">{item.texture}</p>
                      </div>
                      <button onClick={() => removeFromCart(`${item.id}-${item.selectedModel}`)} className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white">
                        <button onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100">
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100">
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4">
              <div className="mb-3 flex items-center gap-2">
                <Tag size={14} className="text-slate-400" />
                <input
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value); setPromoError('') }}
                  placeholder="Promo code"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-300"
                />
                <button onClick={handleApplyPromo} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">Apply</button>
              </div>
              {promoError && <p className="mb-2 text-xs text-red-500">{promoError}</p>}
              {promoCode && (
                <div className="mb-3 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2">
                  <span className="text-xs font-medium text-green-700">{promoCode} applied ({Math.round(promoDiscount * 100)}% off)</span>
                  <button onClick={removePromo} className="text-xs font-medium text-green-600 hover:text-green-800">Remove</button>
                </div>
              )}

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
                <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                <hr className="border-slate-100" />
                <div className="flex justify-between text-base font-semibold text-slate-900"><span>Total</span><span>${total.toFixed(2)}</span></div>
              </div>

              <button onClick={handleCheckout} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
                Checkout
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
