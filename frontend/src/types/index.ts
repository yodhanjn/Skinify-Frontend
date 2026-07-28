export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
  path: string
  errorCode?: string
}

export interface UserResponse {
  userId: number
  username: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  roles: string[]
  isEnabled: boolean
  isAccountNonLocked: boolean
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresInMs: number
  user: UserResponse
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmPassword: string
}

export type DeviceCategory = 'Laptops' | 'Mobiles' | 'Consoles'
export type SkinTexture = 'Matte' | 'Carbon Fiber' | 'Leather' | 'Anime' | 'Minimal'

export interface Product {
  id: string
  name: string
  category: DeviceCategory
  brand: string
  texture: SkinTexture
  price: number
  originalPrice: number
  rating: number
  reviews: number
  badge: string
  description: string
  tags: string[]
  colors: string[]
  compatibleModels: string[]
  accent: string
  image?: string
  stock?: number
}

export interface CartItem extends Product {
  quantity: number
  selectedModel: string
}

export interface UserSession {
  id?: number
  email: string
  firstName?: string
  lastName?: string
  roles?: string[]
}

export interface OrderItem {
  id: string
  productName: string
  model: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  date: string
  shippingAddress: string
}

export interface Address {
  id: string
  label: string
  fullName: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  isDefault: boolean
}
