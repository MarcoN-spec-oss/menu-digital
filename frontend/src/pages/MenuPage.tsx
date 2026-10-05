import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCategories, useDishes, useFeaturedDishes } from '../hooks/useApi';
import { useCartStore } from '../stores/cartStore';
import { Button } from '../components/Button';
import { Card, CardContent, CardFooter } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Search, Filter, X, ChevronDown, Tag, Star } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import type { Category, Dish } from '../types';

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('categoria')
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showCategories, setShowCategories] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: dishesResponse, isLoading: dishesLoading } = useDishes({
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });
  const { data: featuredDishes } = useFeaturedDishes();
  const { addItem, tableNumber } = useCartStore();

  const dishes = dishesResponse?.results || [];
  const isFeaturedView = !selectedCategory && !searchQuery;

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('categoria', selectedCategory);
    if (searchQuery) params.set('q', searchQuery);
    setSearchParams(params, { replace: true });
  }, [selectedCategory, searchQuery, setSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const hasFilters = selectedCategory || searchQuery;

  const dishesByCategory = useMemo(() => {
    if (!categories) return [];
    return categories
      .map((category) => {
        const categoryDishes = dishes.filter((d) => d.category.id === category.id);
        if (categoryDishes.length === 0) return null;
        return { category, dishes: categoryDishes };
      })
      .filter(Boolean) as { category: Category; dishes: Dish[] }[];
  }, [categories, dishes]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nuestro menu</h1>
          <p className="mt-1 text-gray-600">
            Descubre nuestros deliciosos platillos preparados con ingredientes frescos
          </p>
        </div>

        {tableNumber && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-800">
              <span className="font-medium">Mesa activa: {tableNumber}</span>
            </div>
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar platillos..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              aria-label="Buscar platillos"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Limpiar busqueda"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </form>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCategories(!showCategories)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm',
                'hover:bg-gray-50 transition-colors',
                selectedCategory ? 'bg-primary-50 border-primary-200 text-primary-700' : ''
              )}
              aria-expanded={showCategories}
              aria-haspopup="listbox"
            >
              <Filter className="h-5 w-5" aria-hidden="true" />
              <span className="font-medium">
                {selectedCategory
                  ? categories?.find((c) => c.slug === selectedCategory)?.name || 'Categoria'
                  : 'Categorias'}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  showCategories ? 'rotate-180' : ''
                )}
                aria-hidden="true"
              />
            </button>

            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="hidden sm:flex">
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {showCategories && (
          <div className="mb-6 animate-slide-up">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  !selectedCategory
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                )}
              >
                Todas
              </button>
              {categories?.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                    selectedCategory === category.slug
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {(categoriesLoading || dishesLoading) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-t-xl" />
                <CardContent className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(!categoriesLoading && !dishesLoading) && (
          <>
            {isFeaturedView && featuredDishes && featuredDishes.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Destacados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredDishes.slice(0, 6).map((dish) => (
                    <DishCard key={dish.id} dish={dish} onAdd={addItem} />
                  ))}
                </div>
              </section>
            )}

            <section>
              {dishesByCategory.length === 0 && dishes.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">No se encontraron platillos.</p>
                </div>
              )}

              {dishes.length === 0 && hasFilters && (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg">
                    No se encontraron platillos para "{searchQuery}"{selectedCategory && ' en esta categoria'}
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              )}

              {dishesByCategory.map(({ category, dishes: categoryDishes }, index) => (
                <div key={category.id} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                    <Badge variant="outline">{categoryDishes.length} platillos</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryDishes.map((dish) => (
                      <DishCard key={dish.id} dish={dish} onAdd={addItem} />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function DishCard({
  dish,
  onAdd,
}: {
  dish: Dish;
  onAdd: (dish: Dish, quantity?: number) => void;
}) {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {dish.image_url ? (
          <img
            src={dish.image_url}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">Dish</div>
        )}
        {!dish.is_available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg">
              No disponible
            </span>
          </div>
        )}
      </div>
      <CardContent className="flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{dish.name}</h3>
        {dish.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">{dish.description}</p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <span className="text-xl font-bold text-gray-900">{formatPrice(dish.price)}</span>
        <Button
          size="sm"
          onClick={() => onAdd(dish, 1)}
          disabled={!dish.is_available}
          className="w-full sm:w-auto"
        >
          Anadir
        </Button>
      </CardFooter>
    </Card>
  );
}