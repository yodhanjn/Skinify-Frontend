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
}

export const products: Product[] = [
  {
    id: 'aurora-macbook',
    name: 'Aurora Matte for MacBook',
    category: 'Laptops',
    brand: 'Apple',
    texture: 'Matte',
    price: 49,
    originalPrice: 69,
    rating: 4.9,
    reviews: 312,
    badge: 'Best Seller',
    description: 'Precision-cut skin with a silky matte finish for daily carry and desk-ready polish.',
    tags: ['Matte', 'Bubble-free', 'Premium'],
    colors: ['Slate', 'Midnight', 'Pearl'],
    compatibleModels: ['MacBook Air M2', 'MacBook Pro 14'],
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'velocity-iphone',
    name: 'Velocity Carbon for iPhone',
    category: 'Mobiles',
    brand: 'Apple',
    texture: 'Carbon Fiber',
    price: 39,
    originalPrice: 59,
    rating: 4.8,
    reviews: 221,
    badge: 'New',
    description: 'A stealthy carbon weave that hugs the phone without bulk and protects from everyday wear.',
    tags: ['Grip', 'Minimal', 'Slim'],
    colors: ['Graphite', 'Ash'],
    compatibleModels: ['iPhone 15', 'iPhone 14 Pro'],
    accent: 'from-sky-500 to-blue-600',
  },
  {
    id: 'nova-playstation',
    name: 'Nova Leather for PlayStation',
    category: 'Consoles',
    brand: 'Sony',
    texture: 'Leather',
    price: 54,
    originalPrice: 74,
    rating: 4.7,
    reviews: 180,
    badge: 'Limited Drop',
    description: 'Comfort-first console wrap that adds a premium hand-feel and a custom silhouette.',
    tags: ['Leather', 'Comfort', 'Limited'],
    colors: ['Cognac', 'Onyx'],
    compatibleModels: ['PS5 DualSense', 'PS5 Console'],
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'zen-xbox',
    name: 'Zen Minimal for Xbox',
    category: 'Consoles',
    brand: 'Xbox',
    texture: 'Minimal',
    price: 44,
    originalPrice: 64,
    rating: 4.6,
    reviews: 164,
    badge: 'Editor Pick',
    description: 'A clean, understated design that makes every console feel elevated without visual noise.',
    tags: ['Minimal', 'Clean', 'Low-profile'],
    colors: ['Mist', 'Stone'],
    compatibleModels: ['Xbox Series X', 'Xbox One'],
    accent: 'from-fuchsia-500 to-violet-600',
  },
  {
    id: 'lumen-samsung',
    name: 'Lumen Matte for Samsung',
    category: 'Mobiles',
    brand: 'Samsung',
    texture: 'Matte',
    price: 37,
    originalPrice: 52,
    rating: 4.8,
    reviews: 198,
    badge: 'Hot',
    description: 'A smooth matte grip with crisp edge detail for flagship devices and everyday carry.',
    tags: ['Matte', 'Grip', 'Daily'],
    colors: ['Cloud', 'Obsidian'],
    compatibleModels: ['Galaxy S24', 'Z Fold 5'],
    accent: 'from-amber-500 to-orange-500',
  },
  {
    id: 'echo-dell',
    name: 'Echo Anime for Dell',
    category: 'Laptops',
    brand: 'Dell',
    texture: 'Anime',
    price: 46,
    originalPrice: 66,
    rating: 4.7,
    reviews: 152,
    badge: 'Collector',
    description: 'A vivid, art-forward wrap designed for creators who want a standout workstation.',
    tags: ['Anime', 'Art', 'Creator'],
    colors: ['Neon Ink', 'Midnight'],
    compatibleModels: ['XPS 13', 'Latitude 7440'],
    accent: 'from-rose-500 to-pink-500',
  },
]

export const categories = ['Laptops', 'Mobiles', 'Consoles'] as const
export const brands = ['Apple', 'Dell', 'Sony', 'Xbox', 'Samsung'] as const
export const textures = ['Matte', 'Carbon Fiber', 'Leather', 'Anime', 'Minimal'] as const
