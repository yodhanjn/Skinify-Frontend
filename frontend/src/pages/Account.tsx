import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, LogOut, Mail, MapPin, Package, Pencil, Phone, ShieldCheck, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi, userApi } from '../services/api'
import { useStore } from '../store/useStore'
import type { UserResponse } from '../types'

export function Account() {
  const { user, logout, isAuthenticated } = useStore()
  const [profile, setProfile] = useState<UserResponse | null>(user as UserResponse | null)
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' })

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    userApi.getCurrentUser()
      .then((data: UserResponse) => setProfile(data))
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmNewPassword) { toast.error('Passwords do not match'); return }
    setChangingPassword(true)
    try {
      await authApi.changePassword(passwords)
      toast.success('Password changed successfully')
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password'
      toast.error(msg)
    } finally {
      setChangingPassword(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto rounded-2xl bg-indigo-100 p-4 inline-flex"><UserRound size={32} className="text-indigo-600" /></div>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Sign in to manage your account</h1>
        <p className="mt-3 text-slate-600">Track orders, save addresses, and manage your profile.</p>
        <Link to="/auth" className="mt-6 inline-flex rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Go to sign in</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><UserRound size={20} /></div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Account overview</p>
              <h1 className="text-3xl font-semibold text-slate-900">{profile?.firstName || 'Welcome'} {profile?.lastName || ''}</h1>
            </div>
          </div>
          <button onClick={() => { logout(); toast.success('Signed out') }} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Mail size={16} /> Email</div>
            <p className="mt-2 text-sm text-slate-900 truncate">{profile?.email}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Phone size={16} /> Phone</div>
            <p className="mt-2 text-sm text-slate-900">{profile?.phoneNumber || 'Not set'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Package size={16} /> Orders</div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">0</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldCheck size={16} /> Status</div>
            <p className="mt-2 text-sm font-medium text-green-700">{profile?.isEnabled ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Recent Orders</h2>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <Package size={24} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-600">No orders yet</p>
          <p className="mt-1 text-sm text-slate-500">Your order history will appear here.</p>
          <Link to="/catalog" className="mt-4 inline-flex rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white">Start shopping</Link>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6"><Pencil size={18} className="text-indigo-600" /><h2 className="text-xl font-semibold text-slate-900">Change Password</h2></div>
        <div className="max-w-md space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Current password</span>
            <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">New password</span>
            <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 block">Confirm new password</span>
            <input type="password" value={passwords.confirmNewPassword} onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none focus:border-indigo-300" />
          </label>
          <button onClick={handleChangePassword} disabled={changingPassword} className="flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50">
            {changingPassword && <Loader2 size={14} className="animate-spin" />}
            Update password
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-6"><MapPin size={18} className="text-indigo-600" /><h2 className="text-xl font-semibold text-slate-900">Saved Addresses</h2></div>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <MapPin size={24} className="mx-auto text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-600">No saved addresses</p>
          <p className="mt-1 text-sm text-slate-500">Add an address during checkout and it will be saved here.</p>
        </div>
      </motion.div>
    </div>
  )
}
