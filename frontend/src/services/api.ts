import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type {
  ApiResponse,
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  UserResponse,
} from '../types'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

function getStoredAuth(): { token: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem('skinify-auth')
    if (!raw) return { token: null, refreshToken: null }
    const parsed = JSON.parse(raw)
    return { token: parsed?.state?.token ?? parsed?.token ?? null, refreshToken: parsed?.state?.refreshToken ?? parsed?.refreshToken ?? null }
  } catch {
    return { token: null, refreshToken: null }
  }
}

function updateStoredTokens(accessToken: string, refreshToken: string) {
  try {
    const raw = localStorage.getItem('skinify-auth')
    const parsed = raw ? JSON.parse(raw) : {}
    if (parsed.state) {
      parsed.state.token = accessToken
      parsed.state.refreshToken = refreshToken
    } else {
      parsed.token = accessToken
      parsed.refreshToken = refreshToken
    }
    localStorage.setItem('skinify-auth', JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token } = getStoredAuth()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error || !token) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({ resolve: resolve as (token: string) => void, reject })
        }).then((token) => {
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken } = getStoredAuth()
      if (!refreshToken) {
        isRefreshing = false
        localStorage.removeItem('skinify-auth')
        window.location.assign('/auth')
        return Promise.reject(error)
      }

      try {
        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${apiClient.defaults.baseURL}/api/v1/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )
        const payload = response.data.data
        updateStoredTokens(payload.accessToken, payload.refreshToken)
        processQueue(null, payload.accessToken)
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('skinify-auth')
        window.location.assign('/auth')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<UserResponse>>('/api/v1/auth/register', payload).then(unwrap),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/login', payload).then(unwrap),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/api/v1/auth/refresh-token', { refreshToken }).then(unwrap),

  logout: (refreshToken?: string) =>
    apiClient.post<ApiResponse<null>>(
      `/api/v1/auth/logout${refreshToken ? `?refreshToken=${encodeURIComponent(refreshToken)}` : ''}`,
    ),

  verifyEmail: (token: string) =>
    apiClient.get<ApiResponse<null>>(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`),

  resendVerification: (email: string) =>
    apiClient.post<ApiResponse<null>>('/api/v1/auth/resend-verification', { email }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<ApiResponse<null>>('/api/v1/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<ApiResponse<null>>('/api/v1/auth/reset-password', payload),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.post<ApiResponse<null>>('/api/v1/auth/change-password', payload),
}

export const userApi = {
  getCurrentUser: () =>
    apiClient.get<ApiResponse<UserResponse>>('/api/v1/users/me').then(unwrap),

  getAllUsers: () =>
    apiClient.get<ApiResponse<UserResponse[]>>('/api/v1/users').then(unwrap),
}

export default apiClient
