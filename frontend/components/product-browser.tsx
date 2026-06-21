"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, PackageX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryFilter } from "@/components/category-filter"
import { ProductCard } from "@/components/product-card"
import { fetchProducts, type Category, type Product } from "@/lib/products"

function ProductSkeleton() {
  return (
    <div className="flex h-[140px] flex-col justify-between rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-3">
        <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
      <div className="flex items-end justify-between">
        <div className="h-6 w-20 animate-pulse rounded bg-muted" />
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

export function ProductBrowser() {
  const [category, setCategory] = useState<Category>("all")
  const [products, setProducts] = useState<Product[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track the latest request so stale category responses are ignored.
  const requestId = useRef(0)

  const loadInitial = useCallback(async (selected: Category) => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    setProducts([])
    setCursor(null)
    setHasMore(false)
    try {
      const res = await fetchProducts({ category: selected })
      if (id !== requestId.current) return
      setProducts(res.data)
      setCursor(res.nextCursor)
      setHasMore(res.hasMore)
    } catch (err) {
      if (id !== requestId.current) return
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitial(category)
  }, [category, loadInitial])

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return
    const id = requestId.current
    setLoadingMore(true)
    setError(null)
    try {
      const res = await fetchProducts({ category, cursor })
      if (id !== requestId.current) return
      setProducts((prev) => [...prev, ...res.data])
      setCursor(res.nextCursor)
      setHasMore(res.hasMore)
    } catch (err) {
      if (id !== requestId.current) return
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      if (id === requestId.current) setLoadingMore(false)
    }
  }, [category, cursor, loadingMore])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {loading
            ? "Loading products…"
            : `Showing ${products.length} product${products.length === 1 ? "" : "s"}`}
        </p>
        <CategoryFilter
          value={category}
          onChange={setCategory}
          disabled={loading}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : error && products.length === 0 ? (
        <ErrorState message={error} onRetry={() => loadInitial(category)} />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-center pt-2">
            {hasMore ? (
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                size="lg"
                variant="secondary"
                className="min-w-44"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached the end.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
      <PackageX className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">
        No products found in this category.
      </p>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-destructive/40 py-20 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <Button onClick={onRetry} variant="secondary">
        Try again
      </Button>
    </div>
  )
}
