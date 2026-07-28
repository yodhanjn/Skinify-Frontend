import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              Skinify
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Premium protective skins for laptops, phones, and gaming consoles. Precision-cut with 3M materials for a flawless, bubble-free finish that transforms your everyday devices.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">Twitter</a>
              <a href="#" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">Instagram</a>
              <a href="#" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">Discord</a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Shop</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><Link to="/catalog?category=Laptops" className="transition-colors hover:text-indigo-600">Laptop Skins</Link></li>
              <li><Link to="/catalog?category=Mobiles" className="transition-colors hover:text-indigo-600">Phone Skins</Link></li>
              <li><Link to="/catalog?category=Consoles" className="transition-colors hover:text-indigo-600">Console Skins</Link></li>
              <li><Link to="/catalog" className="transition-colors hover:text-indigo-600">All Skins</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Support</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li><a href="#" className="transition-colors hover:text-indigo-600">Order Tracking</a></li>
              <li><a href="#" className="transition-colors hover:text-indigo-600">Shipping Policy</a></li>
              <li><a href="#" className="transition-colors hover:text-indigo-600">Returns & Exchanges</a></li>
              <li><a href="#" className="transition-colors hover:text-indigo-600">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Skinify. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-700">Privacy</a>
            <a href="#" className="hover:text-slate-700">Terms</a>
            <a href="#" className="hover:text-slate-700">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
