import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Mail, Sparkles, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'

const schema = z.object({ email: z.string().email('Please enter a valid email') })
type FormValues = z.infer<typeof schema>

export function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '' } })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await authApi.forgotPassword(values)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
        <Sparkles size={14} /> Password Recovery
      </div>
      <h1 className="mt-4 text-center text-3xl font-semibold text-slate-900">Forgot your password?</h1>
      <p className="mt-3 text-center text-sm leading-6 text-slate-600">Enter your email and we'll send you a reset link valid for 15 minutes.</p>

      {sent ? (
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-green-100 p-4"><CheckCircle2 size={32} className="text-green-600" /></div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Check your email</p>
          <p className="mt-2 text-sm text-slate-600">If an account exists for this email, you'll receive a password reset link shortly.</p>
          <Link to="/auth" className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 w-full space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            <span className="mb-2 flex items-center gap-2"><Mail size={14} /> Email address</span>
            <input {...form.register('email')} type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" placeholder="you@example.com" />
            {form.formState.errors.email && <span className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</span>}
          </label>
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <Link to="/auth" className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </form>
      )}
    </div>
  )
}
