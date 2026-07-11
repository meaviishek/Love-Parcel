import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { LayoutGrid, List, ChevronDown } from 'lucide-react';
import { ShopFilters } from '@/types';
import Skeleton from './ui/Skeleton';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ShopGridProps {
    filters: ShopFilters;
    setFilters: React.Dispatch<React.SetStateAction<ShopFilters>>;
}

const ShopGrid: React.FC<ShopGridProps> = ({ filters, setFilters }) => {
    // Load products from Redux store
    const { products, loading, error } = useSelector((state: RootState) => state.product);
    const [showSortMenu, setShowSortMenu] = useState(false);

    // Filter and Sort Logic
    const filteredProducts = useMemo(() => {
        let result = [...products];

        // Search
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchLower) ||
                (p.description && p.description.toLowerCase().includes(searchLower)) ||
                (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower))) ||
                (p.occasions && p.occasions.some(occ => occ.toLowerCase().includes(searchLower)))
            );
        }

        // Category
        if (filters.category) {
            // Flexible matching for demo purposes (contains checking)
            result = result.filter(p =>
                p.category?.name.toUpperCase().includes(filters.category!.toUpperCase()) ||
                filters.category!.toUpperCase().includes(p.category?.name.toUpperCase() || '')
            );
        }

        // Price
        result = result.filter(p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

        // Sort
        switch (filters.sort) {
            case 'price-low-high':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high-low':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
            case 'rating':
                // Rating not implemented yet, default to Id
                result.sort((a, b) => a.id.localeCompare(b.id));
                break;
            default:
                // Default sorting (by ID string comparison)
                result.sort((a, b) => a.id.localeCompare(b.id));
                break;
        }

        return result;
    }, [products, filters]);

    const handleSortChange = (sortValue: string) => {
        setFilters(prev => ({ ...prev, sort: sortValue }));
        setShowSortMenu(false);
    };

    const sortOptions = [
        { label: 'Default sorting', value: 'default' },
        { label: 'Price: Low to High', value: 'price-low-high' },
        { label: 'Price: High to Low', value: 'price-high-low' },
        { label: 'Newest First', value: 'newest' },

    ];

    const currentSortLabel = sortOptions.find(opt => opt.value === filters.sort)?.label || 'Default sorting';

    return (
        <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-900 gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-400">
                        <LayoutGrid size={20} className="text-white cursor-pointer" />
                        <List size={20} className="cursor-pointer hover:text-white" />
                    </div>
                    <p className="text-sm text-gray-500">
                        Showing {filteredProducts.length} of {products.length} results
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <button
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
                            onClick={() => setShowSortMenu(!showSortMenu)}
                        >
                            {currentSortLabel} <ChevronDown size={14} />
                        </button>

                        {/* Sort Dropdown */}
                        {showSortMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 shadow-lg rounded-md py-1 z-20 border border-gray-800">
                                {sortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/5 ${filters.sort === option.value ? 'text-primary font-medium' : 'text-gray-400'}`}
                                        onClick={() => handleSortChange(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="bg-[#121212] rounded-[32px] p-3 h-full flex flex-col">
                            <Skeleton className="aspect-square rounded-[24px] mb-4" />
                            <div className="px-2 pb-2 flex-1 flex flex-col">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-full mb-6 hidden md:block" />
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-auto gap-2 md:gap-0">
                                    <div className="flex flex-col gap-1">
                                        <Skeleton className="h-3 w-12" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                    <Skeleton className="h-10 w-24 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.name}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            image={product.images[0]}
                            category={product.category?.name || "Uncategorized"}
                            rating={5} // Placeholder as backend doesn't have rating yet
                            isNew={false} // Placeholder
                        />
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center">
                    <p className="text-gray-500">No products found matching your criteria.</p>
                    <button
                        className="mt-4 text-primary underline text-sm"
                        onClick={() => setFilters(prev => ({ ...prev, category: null, search: '', priceRange: [0, 500000] }))}
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShopGrid;
