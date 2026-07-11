import React from 'react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const TrendingProducts = () => {
    const { products } = useSelector((state: RootState) => state.product);

    // Filter products for the Trending section (Placeholder: Just take first 8 for now)
    const trendingProducts = products.slice(0, 8);

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="text-left">
                        <span className="text-primary text-sm font-bold tracking-[0.2em] uppercase mb-2 block">Weekly Highlights</span>
                        <h2 className="text-3xl md:text-5xl font-serif text-white leading-tight">Trending Products</h2>
                        <p className="text-gray-400 mt-4 max-w-lg font-light">
                            Our collection is curated with love and carefully selected to make every occasion special.
                        </p>
                    </div>

                    <Link href="/shop" className="group flex items-center gap-2 text-white border-b border-white/20 pb-1 hover:border-primary hover:text-primary transition-all duration-300">
                        <span className="font-medium">View All Products</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                    {trendingProducts.map((product) => (
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

export default TrendingProducts;
