import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, ShoppingBag, Sparkles, UserRound, X, LogOut, LayoutDashboard, Package } from 'lucide-react'
import { useStore } from '../store/useStore'

const navLinks = [
  { to: '/catalog', label: 'Catalog' },
  { to: '/catalog?category=Laptops', label: 'Laptops' },
  { to: '/catalog?category=Mobiles', label: 'Mobiles' },
  { to: '/catalog?category=Consoles', label: 'Consoles' },
]

export function Navbar() {
  const { cart, toggleCart, isAuthenticated, user, logout, searchQuery, setSearchQuery } = useStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const navigate = useNavigate()
  const profileRef = useRef<HTMLDivElement>(null)
  const isAdmin = user?.roles?.some((r) => r === 'ROLE_ADMIN' || r === 'ROLE_SUPER_ADMIN')

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-sm">
            <Sparkles size={16} />
          </div>
          <span>Skinify</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex focus-within:border-indigo-300 focus-within:bg-white transition-all">
          <Search size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-40 bg-transparent outline-none placeholder:text-slate-400"
            placeholder="Search skins..."
          />
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <button
            onClick={() => toggleCart(true)}
            className="relative rounded-full border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ShoppingBag size={16} />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          <div ref={profileRef} className="relative hidden lg:block">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <UserRound size={16} />
              {isAuthenticated && user ? user.firstName || 'Account' : 'Sign in'}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                >
                  {isAuthenticated ? (
                    <>
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                      <Link to="/account" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        <Package size={16} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setProfileOpen(false); navigate('/') }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" onClick={() => setProfileOpen(false)}>
                        <UserRound size={16} /> Sign in
                      </Link>
                      <Link to="/auth?mode=register" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50" onClick={() => setProfileOpen(false)}>
                        <Sparkles size={16} /> Create account
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              <form onSubmit={handleSearch} className="mb-3 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search size={16} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Search skins..."
                />
              </form>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-2.5 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className="border-slate-100" />
              {isAuthenticated ? (
                <>
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">My Account</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Admin Dashboard</Link>}
                  <button onClick={() => { logout(); setMobileOpen(false); navigate('/') }} className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50">Sign in</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
