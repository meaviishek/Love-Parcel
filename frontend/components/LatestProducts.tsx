import React from 'react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const LatestProducts = () => {
    const { products } = useSelector((state: RootState) => state.product);

    // Filter products for the Latest section (New arrivals - sorted by createdAt desc)
    const latestProducts = [...products]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, 8);

    return (
        <section className="py-20 relative overflow-hidden border-t border-gray-900/50">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="text-left">
                        <span className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-2 block">Fresh Arrivals</span>
                        <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight">Latest Products</h2>
                        <p className="text-gray-400 mt-4 max-w-lg font-light">
                            Discover our newest arrivals, crafted with elegance and style to make every moment memorable.
                        </p>
                    </div>

                    <Link href="/shop" className="group flex items-center gap-2 text-white border-b border-white/20 pb-1 hover:border-primary hover:text-primary transition-all duration-300">
                        <span className="font-medium">View All Products</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Products Grid */}
                {/* Reponsive Grid: 1 col mobile, 2 col tablet, 3 col laptop, 4 col desktop, 5-6 col wide */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                    {latestProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            image={product.images[0] || "/placeholder.png"}
                            title={product.name}
                            price={product.price}
                            category={product.category?.name || "Uncategorized"}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LatestProducts;
