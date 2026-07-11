"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import CategoryList from './CategoryList';

const heroSlides = [
    {
        id: 1,
        image: "https://placehold.co/800x600/1A3C34/1A3C34",
        title: "Where Luxury Meets Affordability",
        subtitle: "Exquisite, handcrafted jewelry that celebrates elegance and individuality."
    },
    {
        id: 2,
        image: "https://placehold.co/800x600/2C5E52/2C5E52",
        title: "Timeless Elegance",
        subtitle: "Discover our new collection of premium handcrafted pieces."
    },
    {
        id: 3,
        image: "https://placehold.co/800x600/D4AF37/D4AF37",
        title: "Shine Bright",
        subtitle: "Perfect gifts for your loved ones this season."
    }
];

const Hero = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[500px]">

                {/* Sidebar Categories */}
                <div className="w-full lg:w-64 hidden lg:block shrink-0 rounded-lg border border-gray-900  overflow-x-auto lg:overflow-y-auto shadow-sm no-scrollbar">
                    <CategoryList className="block min-w-max lg:min-w-0" itemClassName="px-4 py-3 lg:px-6" />
                </div>

                {/* Main Hero Banner Carousel */}
                <div className="w-full lg:flex-1 relative rounded-2xl overflow-hidden group cursor-pointer border border-gray-800 h-[500px] lg:h-auto">
                    {heroSlides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                        >
                            <div className="absolute inset-0 bg-[#1A3C34]">
                                <Image
                                    src={slide.image}
                                    alt={slide.title}
                                    fill
                                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute inset-0 bg-linear-to-r from-[#1A3C34]/80 via-transparent to-transparent"></div>
                            </div>

                            <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-8 md:px-12 max-w-xl text-white">
                                <h2 className="text-3xl md:text-5xl font-serif leading-tight mb-4 drop-shadow-lg">
                                    {slide.title.split(' ').slice(0, 2).join(' ')} <br />
                                    <span className="font-light">{slide.title.split(' ').slice(2).join(' ')}</span>
                                </h2>
                                <p className="text-gray-200 mb-8 text-sm md:text-base font-light max-w-md drop-shadow-md">
                                    {slide.subtitle}
                                </p>
                                <button className="bg-primary text-white px-8 py-3 rounded-full font-medium w-fit flex items-center gap-2 hover:bg-primary-light transition-colors shadow-lg">
                                    Shop Now <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Carousel Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>

                    {/* Hover Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                        <div className="bg-black/40 backdrop-blur-sm p-4 rounded-full">
                            <ArrowRight className="text-white w-8 h-8" />
                        </div>
                    </div>
                </div>

                {/* Promo Banners (Right Side on Desktop / Below on Mobile) */}
                <div className="flex flex-row xl:flex-col gap-4 w-full xl:w-72 shrink-0 h-40 md:h-64 lg:h-auto">
                    {/* Banner 1: Flash Sale */}
                    <div className="flex-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                        <Image
                            src="https://placehold.co/400x300/1A1A1A/FFF?text=Flash+Sale"
                            alt="Flash Sale"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                        <div className="absolute bottom-3 left-0 right-0 text-center text-white p-2 md:p-4">
                            <span className="bg-primary text-white text-[8px] md:text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-1 md:mb-2 inline-block">Limited Time</span>
                            <h3 className="text-sm md:text-xl font-serif">Flash Sale</h3>
                        </div>
                    </div>

                    {/* Banner 2: New Collection */}
                    <div className="flex-1 relative rounded-2xl overflow-hidden group cursor-pointer">
                        <Image
                            src="https://placehold.co/400x300/D4AF37/FFF?text=New+Collection"
                            alt="New Collection"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                        <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 text-white">
                            <h3 className="text-sm md:text-xl font-serif mb-1">New <br className="hidden md:block" /> Collection</h3>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;
