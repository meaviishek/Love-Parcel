import React from 'react';
import Image from 'next/image';

const CollectionBanner = () => {
    return (
        <section className="w-full relative h-[400px] md:h-[500px] overflow-hidden">
            <Image
                src="https://placehold.co/1920x800/F5F5F5/D4AF37?text=Gold+Rings+Collection"
                alt="Latest Trends"
                fill
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>

            <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Olight Collection</p>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6">
                    Shop The Latest Trends
                </h2>
                <p className="text-gray-300 mb-8 max-w-lg text-sm md:text-base">
                    Exceptional Handcrafted Design to Enhance the Magnificent Glow
                </p>
                <button className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-sm hover:bg-white hover:text-black transition-colors">
                    Shop Now
                </button>
            </div>
        </section>
    );
};

export default CollectionBanner;
