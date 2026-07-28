import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { CartDrawer } from './CartDrawer'

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
