export const API_BASE = "https://codevector-product-api.onrender.com"

export const CATEGORIES = [
  "all",
  "electronics",
  "clothing",
  "books",
  "furniture",
  "sports",
  "toys",
  "beauty",
  "food",
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Product {
  id: string
  name: string
  category: string
  price: string
  created_at: string
  updated_at: string
}

export interface ProductsResponse {
  data: Product[]
  nextCursor: string | null
  hasMore: boolean
}

interface FetchParams {
  category: Category
  cursor?: string | null
  limit?: number
}

export async function fetchProducts({
  category,
  cursor,
  limit = 12,
}: FetchParams): Promise<ProductsResponse> {
  const params = new URLSearchParams()
  params.set("limit", String(limit))
  if (category && category !== "all") params.set("category", category)
  if (cursor) params.set("cursor", cursor)

  const res = await fetch(`${API_BASE}/products?${params.toString()}`)
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }
  return res.json()
}

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

export function formatPrice(price: string): string {
  const value = Number(price)
  if (Number.isNaN(value)) return price
  return priceFormatter.format(value)
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return dateFormatter.format(date)
}
