"use client";
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Minus, Plus, Filter } from 'lucide-react';
import { ShopFilters } from '@/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface ShopSidebarProps {
    filters: ShopFilters;
    setFilters: React.Dispatch<React.SetStateAction<ShopFilters>>;
}



const ShopSidebar: React.FC<ShopSidebarProps> = ({ filters, setFilters }) => {
    const { categories } = useSelector((state: RootState) => state.category);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        carats: true,
        brands: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCategoryClick = (category: string) => {
        setFilters(prev => ({
            ...prev,
            category: prev.category === category ? null : category
        }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setFilters(prev => ({
            ...prev,
            priceRange: [prev.priceRange[0], value]
        }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({
            ...prev,
            search: e.target.value
        }));
    };



    const carats = [
        { name: '14KT', count: 2 },
        { name: '18KT', count: 2 },
        { name: '22KT', count: 2 },
        { name: '24KT', count: 2 },
    ];

    return (
        <aside className="w-full lg:w-64 shrink-0 pr-0 lg:pr-8">
            {/* Mobile Filter Toggle */}
            <button
                className="lg:hidden w-full flex items-center justify-between bg-[#121212] text-white border border-gray-800 p-4 rounded-lg mb-4"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
                <div className="flex items-center gap-2">
                    <Filter size={20} />
                    <span className="font-bold font-serif">Filter Products</span>
                </div>
                {isFiltersOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            {/* Filter Content */}
            <div className={`${isFiltersOpen ? 'block' : 'hidden'} lg:block space-y-8`}>
                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={filters.search}
                        onChange={handleSearchChange}
                        className="w-full bg-gray-900 border-none rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-gray-700 outline-none text-white placeholder:text-gray-500"
                    />
                    <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                {/* Categories */}
                <div className="border-b border-gray-800 pb-6">
                    <div
                        className="flex items-center justify-between cursor-pointer mb-4"
                        onClick={() => toggleSection('categories')}
                    >
                        <h3 className="text-lg font-serif text-white">Categories</h3>
                        {expandedSections.categories ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                    {expandedSections.categories && (
                        <ul className="space-y-3">
                            <li
                                onClick={() => setFilters(prev => ({ ...prev, category: null }))}
                                className={`flex items-center justify-between text-sm cursor-pointer transition-colors ${!filters.category ? 'text-primary font-medium' : 'text-gray-400 hover:text-primary'}`}
                            >
                                <span>All Categories</span>
                            </li>
                            {categories.map((cat) => (
                                <li
                                    key={cat.id}
                                    className={`flex items-center justify-between text-sm cursor-pointer transition-colors ${filters.category === cat.slug ? 'text-primary font-medium' : 'text-gray-400 hover:text-primary'}`}
                                    onClick={() => handleCategoryClick(cat.slug)}
                                >
                                    <span>{cat.name}</span>
                                    <span className="text-gray-400">({cat._count?.products || 0})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Filter By Price */}
                <div className="border-b border-gray-800 pb-6">
                    <div
                        className="flex items-center justify-between cursor-pointer mb-4"
                        onClick={() => toggleSection('price')}
                    >
                        <h3 className="text-lg font-serif text-white">Filter By Price</h3>
                        {expandedSections.price ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                    {expandedSections.price && (
                        <div className="space-y-4">
                            <input
                                type="range"
                                min="0"
                                max="100000"
                                value={filters.priceRange[1]}
                                onChange={handlePriceChange}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-[#D4AF37]">
                                    Price: <span className="font-medium text-white">₹{filters.priceRange[0].toFixed(2)} — ₹{filters.priceRange[1].toFixed(2)}</span>
                                </div>
                                <button className="bg-primary text-white text-xs px-3 py-1.5 rounded-sm hover:bg-primary-light transition-colors">
                                    Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Carats */}
                <div className="border-b border-gray-800 pb-6">
                    <div
                        className="flex items-center justify-between cursor-pointer mb-4"
                        onClick={() => toggleSection('carats')}
                    >
                        <h3 className="text-lg font-serif text-white">Carats</h3>
                        {expandedSections.carats ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                    {expandedSections.carats && (
                        <ul className="space-y-3">
                            {carats.map((carat) => (
                                <li key={carat.name} className="flex items-center justify-between text-sm cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full border border-gray-700 group-hover:border-primary flex items-center justify-center">
                                            {/* Radio-like appearance but using div for custom style */}
                                        </div>
                                        <span className="text-gray-400 group-hover:text-primary transition-colors">{carat.name}</span>
                                    </div>
                                    <span className="text-gray-400">({carat.count})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default ShopSidebar;

