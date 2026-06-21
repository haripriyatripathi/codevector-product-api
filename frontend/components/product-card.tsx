import { CalendarDays } from "lucide-react"
import { formatDate, formatPrice, type Product } from "@/lib/products"

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
          {product.category}
        </span>
        <h3 className="text-pretty text-base font-semibold leading-snug text-card-foreground">
          {product.name}
        </h3>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-xl font-bold tracking-tight text-card-foreground">
          {formatPrice(product.price)}
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {formatDate(product.created_at)}
        </p>
      </div>
    </article>
  )
}
