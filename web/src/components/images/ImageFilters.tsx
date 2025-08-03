import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ImageCategory, ImageFilters as IImageFilters } from '@/types/images'

interface ImageFiltersProps {
  filters: IImageFilters
  categories: ImageCategory[]
  onChange: (filters: IImageFilters) => void
}

export function ImageFilters({ filters, categories, onChange }: ImageFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select
        value={filters.categoryId || 'all'}
        onValueChange={(value) => 
          onChange({ 
            ...filters, 
            categoryId: value === 'all' ? undefined : value 
          })
        }
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Array.isArray(categories) && categories.length > 0 ? (
            categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-categories" disabled>
              No categories available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
