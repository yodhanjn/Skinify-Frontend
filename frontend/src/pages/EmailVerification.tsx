import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, XCircle, Sparkles } from 'lucide-react'
import { authApi } from '../services/api'

export function EmailVerification() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    authApi.verifyEmail(token).then(() => setStatus('success')).catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
      <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
        <Sparkles size={14} /> Email Verification
      </div>
      <h1 className="mt-4 text-center text-3xl font-semibold text-slate-900">Verify your email</h1>

      <div className="mt-8 flex flex-col items-center text-center">
        {status === 'loading' && (
          <>
            <Loader2 size={40} className="animate-spin text-indigo-600" />
            <p className="mt-4 text-sm text-slate-600">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="rounded-2xl bg-green-100 p-4"><CheckCircle2 size={32} className="text-green-600" /></div>
            <p className="mt-4 text-lg font-semibold text-slate-900">Email verified!</p>
            <p className="mt-2 text-sm text-slate-600">Your account is now active. You can sign in.</p>
            <Link to="/auth" className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Sign in</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="rounded-2xl bg-red-100 p-4"><XCircle size={32} className="text-red-600" /></div>
            <p className="mt-4 text-lg font-semibold text-slate-900">Verification failed</p>
            <p className="mt-2 text-sm text-slate-600">The link may have expired or is invalid. Please request a new verification email.</p>
            <Link to="/auth" className="mt-6 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700">Back to sign in</Link>
          </>
        )}
      </div>
    </div>
  )
}
