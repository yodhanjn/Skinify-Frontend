import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Lock, User, Phone, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../services/api'
import { useStore } from '../store/useStore'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Enter a valid phone number (E.164 format)'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain an uppercase letter').regex(/[a-z]/, 'Must contain a lowercase letter').regex(/[0-9]/, 'Must contain a number').regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

type LoginValues = z.infer<typeof loginSchema>
type RegisterValues = z.infer<typeof registerSchema>

export function Auth() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useStore()
  const navigate = useNavigate()

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const registerForm = useForm<RegisterValues>({ resolver: zodResolver(registerSchema), defaultValues: { firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' } })

  const onLogin = async (values: LoginValues) => {
    setLoading(true)
    try {
      const response = await authApi.login(values)
      login({ token: response.accessToken, refreshToken: response.refreshToken, user: response.user })
      toast.success('Welcome back!')
      navigate('/account')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (values: RegisterValues) => {
    setLoading(true)
    try {
      await authApi.register(values)
      toast.success('Account created! Please check your email to verify.')
      setMode('login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:p-10">
      <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="flex-1 rounded-[24px] border border-slate-200 bg-slate-50 p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
          <Sparkles size={14} /> Secure access
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Welcome to Skinify</h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          {mode === 'login'
            ? 'Sign in to track orders, save addresses, and customize every skin with your account.'
            : 'Create your account to start customizing premium skins for all your devices.'}
        </p>
        <div className="mt-8 space-y-3">
          {['Track orders in real-time', 'Save multiple shipping addresses', 'Access exclusive member designs', 'Get early access to new drops'].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100"><ArrowRight size={10} className="text-indigo-600" /></div>
              {item}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="w-full max-w-md rounded-[24px] border border-slate-200 bg-white p-6">
        <div className="mb-6 flex rounded-full bg-slate-100 p-1">
          <button onClick={() => setMode('login')} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${mode === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Login</button>
          <button onClick={() => setMode('register')} className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${mode === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Register</button>
        </div>

        {mode === 'login' ? (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><Mail size={14} /> Email</span>
              <input {...loginForm.register('email')} type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" placeholder="you@example.com" />
              {loginForm.formState.errors.email && <span className="mt-1 text-xs text-red-500">{loginForm.formState.errors.email.message}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><Lock size={14} /> Password</span>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} {...loginForm.register('password')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 outline-none transition-colors focus:border-indigo-300 focus:bg-white" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {loginForm.formState.errors.password && <span className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</span>}
            </label>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</Link>
            </div>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><User size={14} /> First name</span>
                <input {...registerForm.register('firstName')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
                {registerForm.formState.errors.firstName && <span className="mt-1 text-xs text-red-500">{registerForm.formState.errors.firstName.message}</span>}
              </label>
              <label className="block text-sm font-medium text-slate-700">
                <span className="mb-2 flex items-center gap-2"><User size={14} /> Last name</span>
                <input {...registerForm.register('lastName')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
                {registerForm.formState.errors.lastName && <span className="mt-1 text-xs text-red-500">{registerForm.formState.errors.lastName.message}</span>}
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><Mail size={14} /> Email</span>
              <input {...registerForm.register('email')} type="email" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
              {registerForm.formState.errors.email && <span className="mt-1 text-xs text-red-500">{registerForm.formState.errors.email.message}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><Phone size={14} /> Phone number</span>
              <input {...registerForm.register('phoneNumber')} placeholder="+15550123456" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
              {registerForm.formState.errors.phoneNumber && <span className="mt-1 text-xs text-red-500">{registerForm.formState.errors.phoneNumber.message}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><Lock size={14} /> Password</span>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} {...registerForm.register('password')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {registerForm.formState.errors.password && <span className="mt-1 text-xs text-red-500">{registerForm.formState.errors.password.message}</span>}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span className="mb-2 flex items-center gap-2"><Lock size={14} /> Confirm password</span>
              <input type="password" {...registerForm.register('confirmPassword')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition-colors focus:border-indigo-300 focus:bg-white" />
              {registerForm.formState.errors.confirmPassword && <span className="mt-1 text-xs text-red-500">{registerForm.formState.errors.confirmPassword.message}</span>}
            </label>
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
