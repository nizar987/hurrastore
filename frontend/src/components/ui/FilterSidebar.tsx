import React, { useState } from 'react';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

interface FilterState {
  priceRange: [number, number];
  minRating: number;
  inStock: boolean;
  categories: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: string[];
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  categories,
  className,
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const clearFilters = () => {
    onFiltersChange({
      priceRange: [0, 500],
      minRating: 0,
      inStock: false,
      categories: [],
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Price Range</h3>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="500"
            value={filters.priceRange[1]}
            onChange={(e) => handleFilterChange({
              priceRange: [filters.priceRange[0], parseInt(e.target.value)]
            })}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-neutral-600">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleFilterChange({ categories: [] })}
            className={cn(
              'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
              filters.categories.length === 0
                ? 'bg-primary-100 text-primary-700'
                : 'text-neutral-700 hover:bg-neutral-100'
            )}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                const newCategories = filters.categories.includes(category)
                  ? filters.categories.filter(c => c !== category)
                  : [...filters.categories, category];
                handleFilterChange({ categories: newCategories });
              }}
              className={cn(
                'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                filters.categories.includes(category)
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-100'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => handleFilterChange({ minRating: rating })}
              className={cn(
                'flex items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                filters.minRating === rating
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-neutral-700 hover:bg-neutral-100'
              )}
            >
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn(
                    'h-4 w-4',
                    i < rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                  )} />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Availability</h3>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-neutral-700">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        size="sm"
        onClick={clearFilters}
        className="w-full"
      >
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn('hidden lg:block lg:w-64', className)}>
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </button>

      {/* Mobile Filter Modal */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
