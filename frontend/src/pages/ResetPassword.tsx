import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'

const schema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type FormValues = z.infer<typeof schema>

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { newPassword: '', confirmPassword: '' } })

  const onSubmit = async (values: FormValues) => {
    if (!token) { toast.error('Invalid or missing reset token.'); return }
    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword: values.newPassword, confirmPassword: values.confirmPassword })
      setSuccess(true)
    } catch {
      toast.error('Reset link expired or invalid. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
        <Sparkles size={14} /> Reset Password
      </div>
      <h1 className="mt-4 text-center text-3xl font-semibold text-slate-900">Create new password</h1>
      <p className="mt-3 text-center text-sm leading-6 text-slate-600">Choose a strong password for your account.</p>

      {success ? (
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-green-100 p-4"><CheckCircle2 size={32} className="text-green-600" /></div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Password reset successfully</p>
          <p className="mt-2 text-sm text-slate-600">You can now sign in with your new password.</p>
          <Link to="/auth" className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Sign in</Link>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 w-full space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 flex items-center gap-2"><KeyRound size={14} /> New password</span>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} {...form.register('newPassword')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.formState.errors.newPassword && <span className="mt-1 text-xs text-red-500">{form.formState.errors.newPassword.message}</span>}
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 flex items-center gap-2"><KeyRound size={14} /> Confirm password</span>
            <input type="password" {...form.register('confirmPassword')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
            {form.formState.errors.confirmPassword && <span className="mt-1 text-xs text-red-500">{form.formState.errors.confirmPassword.message}</span>}
          </label>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
          <Link to="/auth" className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </form>
      )}
    </div>
  )
}
