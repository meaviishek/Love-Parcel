import React from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

const HandmadeBanner = () => {
    return (
        <section className="container mx-auto px-4 py-12">
            <div className="relative rounded-3xl overflow-hidden h-[400px] md:h-[500px] w-full">
                <Image
                    src="https://placehold.co/1600x800/E5E5E5/333?text=Handmade+Jewelry+Model"
                    alt="Handmade Jewelry"
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/90 md:to-white/80"></div>

                <div className="absolute inset-0 flex flex-col justify-end md:justify-center items-end p-8 md:p-20 text-right">
                    <div className="max-w-lg">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Our Challenge To Do Better</p>
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6 leading-tight">
                            All Of Our Jewellery <br /> Is Handmade
                        </h2>
                        <p className="text-gray-600 mb-8 text-sm md:text-base">
                            Handcrafted with passion and precision, ensuring every piece tells a unique story of elegance and artistry.
                        </p>
                        <button className="w-12 h-12 rounded-full border border-gray-900 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors ml-auto">
                            <ArrowUpRight size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HandmadeBanner;
