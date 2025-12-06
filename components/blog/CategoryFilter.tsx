'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/sanity';

interface CategoryFilterProps {
  categories: Category[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (slug) {
      params.set('category', slug);
      params.delete('page'); // Reset a página 1
    } else {
      params.delete('category');
      params.delete('page');
    }

    const query = params.toString();
    router.push(`/blog${query ? `?${query}` : ''}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botón "Todas" */}
      <Button
        variant={!currentCategory ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleCategoryClick(null)}
      >
        Todas
        {!currentCategory && (
          <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {categories.reduce((acc, cat) => acc + (cat.postCount || 0), 0)}
          </span>
        )}
      </Button>

      {/* Categorías */}
      {categories.map((category) => {
        const isActive = currentCategory === category.slug.current;

        return (
          <Button
            key={category._id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryClick(category.slug.current)}
            style={
              isActive && category.color
                ? {
                    backgroundColor: category.color,
                    borderColor: category.color,
                    color: 'white',
                  }
                : {}
            }
          >
            {category.title}
            {category.postCount !== undefined && (
              <span
                className={cn(
                  'ml-2 rounded-full px-2 py-0.5 text-xs',
                  isActive
                    ? 'bg-white/20'
                    : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'
                )}
              >
                {category.postCount}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
