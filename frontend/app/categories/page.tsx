"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Gift, Heart, Cake, Sparkles, User,
    Watch, Search, ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import MobileBottomNav from '@/components/MobileBottomNav';

const CategoriesPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('foryou');

    const categories = [
        { id: 'foryou', name: 'For You', icon: Sparkles },
        { id: 'hampers', name: 'Gift Hampers', icon: Gift },
        { id: 'personalized', name: 'Personalized', icon: User },
        { id: 'flowers', name: 'Flowers & Cakes', icon: Cake },
        { id: 'couple', name: 'Couple Gifts', icon: Heart },
        { id: 'watches', name: 'Watches', icon: Watch },
    ];

    const categoryContent: Record<string, any[]> = {
        foryou: [
            { title: "Top Deals", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Top+Deals", href: "/shop" },
            { title: "New Arrivals", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=New", href: "/shop?sort=new" },
            { title: "Best Sellers", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Best", href: "/shop?sort=rating" },
        ],
        hampers: [
            { title: "Spa Hampers", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Spa", href: "/shop?category=Gift Hampers" },
            { title: "Chocolate", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Choc", href: "/shop?category=Gift Hampers" },
            { title: "Grooming", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Men", href: "/shop?category=Gift Hampers" },
            { title: "Tea & Coffee", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Tea", href: "/shop?category=Gift Hampers" },
        ],
        personalized: [
            { title: "Frames", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Frames", href: "/shop?category=Personalized Gifts" },
            { title: "Lamps", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Lamps", href: "/shop?category=Personalized Gifts" },
            { title: "Wallets", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Wallets", href: "/shop?category=Personalized Gifts" },
        ],
        flowers: [
            { title: "Roses", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Roses", href: "/shop?category=Flowers & Cakes" },
            { title: "Cakes", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Cakes", href: "/shop?category=Flowers & Cakes" },
            { title: "Combos", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Combos", href: "/shop?category=Flowers & Cakes" },
        ],
        couple: [
            { title: "Mugs", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Mugs", href: "/shop?category=Couple Gifts" },
            { title: "Apparel", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Tees", href: "/shop?category=Couple Gifts" },
            { title: "Games", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Games", href: "/shop?category=Couple Gifts" },
        ],
        watches: [
            { title: "Men's", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Men", href: "/shop" },
            { title: "Women's", image: "https://placehold.co/150x150/1a1a1a/FFFFFF/png?text=Women", href: "/shop" },
        ],
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20 md:pb-0">

            {/* Mobile Header */}
            <header className="md:hidden sticky top-0 bg-black z-20 px-4 py-3 shadow-sm border-b border-gray-900 flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search for gifts..."
                        className="w-full bg-[#1A1A1A] pl-10 pr-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 text-white placeholder:text-gray-600"
                    />
                </div>
            </header>

            {/* Desktop Header */}
            <div className="hidden md:block container mx-auto px-4 py-8">
                <h1 className="text-4xl font-serif font-bold mb-2">Categories</h1>
                <p className="text-gray-400">Explore our curated collection of gifts for every occasion.</p>
            </div>

            <div className="flex h-[calc(100vh-130px)] md:h-auto md:min-h-[600px] md:container md:mx-auto md:px-4 md:gap-8">
                {/* Sidebar */}
                <aside className="w-24 md:w-72 bg-[#121212] shrink-0 overflow-y-auto no-scrollbar border-r border-gray-900 md:border-none md:bg-transparent md:space-y-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`w-full flex md:flex-row flex-col items-center md:items-center justify-center md:justify-start py-4 md:py-4 px-1 md:px-6 gap-1 md:gap-4 transition-all relative md:rounded-xl group ${selectedCategory === cat.id
                                ? 'bg-black md:bg-[#1A1A1A] text-primary shadow-lg shadow-primary/5'
                                : 'text-gray-500 hover:text-gray-300 md:hover:bg-[#121212]'
                                }`}
                        >
                            {selectedCategory === cat.id && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full md:hidden" />
                            )}
                            {/* Desktop Active Indicator */}
                            {selectedCategory === cat.id && (
                                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full" />
                            )}

                            <div className={`p-2 rounded-full ${selectedCategory === cat.id ? 'bg-primary/10' : 'bg-transparent group-hover:bg-gray-800'}`}>
                                <cat.icon size={24} strokeWidth={1.5} />
                            </div>
                            <span className="text-[10px] md:text-base font-medium text-center md:text-left leading-tight">{cat.name}</span>
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 bg-black md:bg-transparent md:p-0">
                    <div className="mb-6">
                        <h2 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-white">
                            {categories.find(c => c.id === selectedCategory)?.name}
                            <ArrowRight size={16} className="text-gray-600 md:hidden" />
                        </h2>

                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {categoryContent[selectedCategory]?.map((item, index) => (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className="group flex flex-col items-center gap-3 bg-[#121212] p-3 rounded-2xl hover:bg-[#1A1A1A] transition-colors"
                                >
                                    <div className="aspect-square w-full relative overflow-hidden rounded-xl bg-[#1A1A1A] border border-gray-800 group-hover:border-primary/50 transition-colors">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover p-2 group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <span className="text-xs md:text-sm font-medium text-center text-gray-300 group-hover:text-white transition-colors">{item.title}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Promotional Banner (Mock) */}
                    <div className="w-full aspect-3/1 bg-linear-to-r from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mb-6 border border-primary/10">
                        <div className="text-center">
                            <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">Special Offer</p>
                            <p className="font-serif font-bold text-white">Flat 20% OFF</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CategoriesPage;
