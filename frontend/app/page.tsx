import { ProductBrowser } from "@/components/product-browser"

export default function Page() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-2">
        <span className="text-sm font-medium text-primary">Catalog</span>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Browse Products
        </h1>
        <p className="max-w-xl text-pretty text-muted-foreground">
          Explore the catalog by category. Prices and listing dates are pulled
          live from the products API.
        </p>
      </header>

      <ProductBrowser />
    </main>
  )
}
