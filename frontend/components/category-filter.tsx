"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORIES, type Category } from "@/lib/products"

export function CategoryFilter({
  value,
  onChange,
  disabled,
}: {
  value: Category
  onChange: (value: Category) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="category-filter"
        className="text-sm font-medium text-muted-foreground"
      >
        Category
      </label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as Category)}
        disabled={disabled}
      >
        <SelectTrigger id="category-filter" className="w-44 capitalize">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => (
            <SelectItem key={category} value={category} className="capitalize">
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
