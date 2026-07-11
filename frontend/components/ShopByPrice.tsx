import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const priceRanges = [
    {
        label: "Under\n₹999",
        link: "/shop?price_max=999",
        image: "https://placehold.co/400x600/220000/FFFFFF/png?text= "
    },
    {
        label: "Under\n₹1,499",
        link: "/shop?price_max=1499",
        image: "https://placehold.co/400x600/330000/FFFFFF/png?text= "
    },
    {
        label: "Under\n₹2,999",
        link: "/shop?price_max=2999",
        image: "https://placehold.co/400x600/440000/FFFFFF/png?text= "
    },
    {
        label: "Under\n₹4,999",
        link: "/shop?price_max=4999",
        image: "https://placehold.co/400x600/550000/FFFFFF/png?text= "
    },
];

const ShopByPrice = () => {
    return (
        <section className="relative py-12 px-4 overflow-hidden">
            <div className="container mx-auto relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
                    {priceRanges.map((range, index) => (
                        <Link
                            key={index}
                            href={range.link}
                            className="group relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-1 block"
                        >
                            {/* Background Image */}
                            <Image
                                src={range.image}
                                alt={range.label.replace('\n', ' ')}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>

                            {/* Red Tint Hover */}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-3xl md:text-4xl font-serif text-white font-bold leading-tight drop-shadow-md group-hover:scale-105 transition-transform duration-300 whitespace-pre-line">
                                    {range.label}
                                </span>

                                <div className="absolute bottom-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center gap-2 text-white/90 text-sm font-medium bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20">
                                    <span>Browse</span>
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShopByPrice;
