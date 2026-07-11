"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ShopSidebar from '@/components/ShopSidebar';
import ShopGrid from '@/components/ShopGrid';
import CollectionBanner from '@/components/CollectionBanner';
import { ShopFilters } from '@/types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { useEffect } from 'react';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';

import { useSearchParams, useRouter } from 'next/navigation';

export default function ShopPage() {
    const dispatch = useDispatch<AppDispatch>();
    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize filters from URL or defaults
    const [filters, setFilters] = useState<ShopFilters>({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || null,
        priceRange: [
            Number(searchParams.get('price_min')) || 0,
            Number(searchParams.get('price_max')) || 50000
        ],
        sort: 'default',
        occasions: searchParams.get('occasions') || undefined,
        tags: searchParams.get('tags') || undefined
    });

    useEffect(() => {
        dispatch(fetchProducts({
            search: filters.search,
            category: filters.category || undefined,
            occasion: filters.occasions,
            tags: filters.tags,
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1]
        }));
        dispatch(fetchCategories());
    }, [dispatch, filters.search, filters.category, filters.occasions, filters.tags, filters.priceRange]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
        if (filters.occasions) params.set('occasions', filters.occasions);
        if (filters.tags) params.set('tags', filters.tags);
        if (filters.priceRange[0] > 0) params.set('price_min', filters.priceRange[0].toString());
        if (filters.priceRange[1] < 50000) params.set('price_max', filters.priceRange[1].toString());

        // Use replace to avoid cluttering history stack with every keystroke/slider move
        // and scroll: false to maintain position
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [filters, router]);

    return (
        <main className="min-h-screen bg-black">

            <div className="container mx-auto p-4 pb-16">
                <div className="flex flex-col lg:flex-row gap-8">
                    <ShopSidebar filters={filters} setFilters={setFilters} />
                    <ShopGrid filters={filters} setFilters={setFilters} />
                </div>
            </div>

            <div className="mb-16">
                <CollectionBanner />
            </div>

        </main>
    );
}
