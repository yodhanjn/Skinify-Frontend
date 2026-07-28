import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard, Loader2, MapPin, Package, ShieldCheck, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../store/useStore'

const steps = ['Shipping', 'Payment', 'Review'] as const

export function Checkout() {
  const { cart, promoDiscount, promoCode } = useStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const navigate = useNavigate()

  const [shipping, setShipping] = useState({ fullName: '', street: '', city: '', state: '', zip: '', country: 'US', phone: '' })
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', nameOnCard: '' })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = subtotal * promoDiscount
  const tax = (subtotal - discount) * 0.08
  const total = subtotal - discount + tax

  const handlePlaceOrder = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    setCompleted(true)
    toast.success('Order placed successfully!')
  }

  if (cart.length === 0 && !completed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="rounded-2xl bg-slate-100 p-4"><ShoppingBag size={32} className="text-slate-400" /></div>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-sm text-slate-500">Add some skins before checking out.</p>
        <Link to="/catalog" className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white">Browse Catalog</Link>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
          <div className="rounded-full bg-green-100 p-6"><CheckCircle2 size={48} className="text-green-600" /></div>
        </motion.div>
        <h2 className="mt-6 text-3xl font-semibold text-slate-900">Order confirmed!</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">Thank you for your purchase. You'll receive a confirmation email shortly with tracking details.</p>
        <p className="mt-2 text-sm text-slate-500">Order #SF-{Math.floor(10000 + Math.random() * 90000)}</p>
        <div className="mt-8 flex gap-3">
          <Link to="/account" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">View orders</Link>
          <button onClick={() => navigate('/catalog')} className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white">Continue shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button onClick={() => i < step && setStep(i)} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${i === step ? 'bg-indigo-600 text-white' : i < step ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </button>
              <span className={`text-sm font-medium ${i === step ? 'text-slate-900' : 'text-slate-400'}`}>{s}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6"><MapPin size={18} className="text-indigo-600" /><h2 className="text-lg font-semibold text-slate-900">Shipping Address</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                <span className="mb-2 block">Full name</span>
                <input value={shipping.fullName} onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                <span className="mb-2 block">Street address</span>
                <input value={shipping.street} onChange={(e) => setShipping({ ...shipping, street: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">City</span>
                <input value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">State</span>
                <input value={shipping.state} onChange={(e) => setShipping({ ...shipping, state: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">ZIP Code</span>
                <input value={shipping.zip} onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Phone</span>
                <input value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
            </div>
            <button onClick={() => setStep(1)} className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Continue to payment</button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6"><CreditCard size={18} className="text-indigo-600" /><h2 className="text-lg font-semibold text-slate-900">Payment Details</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                <span className="mb-2 block">Name on card</span>
                <input value={payment.nameOnCard} onChange={(e) => setPayment({ ...payment, nameOnCard: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                <span className="mb-2 block">Card number</span>
                <input value={payment.cardNumber} onChange={(e) => setPayment({ ...payment, cardNumber: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">Expiry</span>
                <input value={payment.expiry} onChange={(e) => setPayment({ ...payment, expiry: e.target.value })} placeholder="MM/YY" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 block">CVV</span>
                <input value={payment.cvv} onChange={(e) => setPayment({ ...payment, cvv: e.target.value })} placeholder="123" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
              </label>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
              <ShieldCheck size={14} className="text-indigo-600" /> Your payment information is encrypted and secure.
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(0)} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">Back</button>
              <button onClick={() => setStep(2)} className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Review order</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6"><Package size={18} className="text-indigo-600" /><h2 className="text-lg font-semibold text-slate-900">Order Summary</h2></div>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedModel}`} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${item.accent}`} />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.selectedModel} × {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-600">Shipping to</p>
              <p className="text-sm text-slate-900">{shipping.fullName || 'Not provided'}</p>
              <p className="text-xs text-slate-500">{shipping.street}, {shipping.city} {shipping.state} {shipping.zip}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setStep(1)} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">Back</button>
              <button onClick={handlePlaceOrder} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'Placing order...' : `Pay $${total.toFixed(2)}`}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:h-fit">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Order Summary</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between"><span>Subtotal ({cart.length} items)</span><span>${subtotal.toFixed(2)}</span></div>
          {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount ({promoCode})</span><span>-${discount.toFixed(2)}</span></div>}
          <div className="flex justify-between"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">{subtotal >= 60 ? 'Free' : '$5.99'}</span></div>
          <hr className="border-slate-100" />
          <div className="flex justify-between text-base font-semibold text-slate-900"><span>Total</span><span>${(total + (subtotal >= 60 ? 0 : 5.99)).toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  )
}
