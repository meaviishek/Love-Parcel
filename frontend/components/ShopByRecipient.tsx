import React from 'react';
import Image from 'next/image';
import { Heart, Gift, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const recipients = [
    {
        id: 1,
        title: "Love Gifts for Him",
        subtitle: "Sophisticated keepsakes he'll cherish.",
        image: "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=1000&auto=format&fit=crop",
        icon: <Gift className="w-6 h-6 text-white" />,
        link: "/shop?search=for-him",
        overlay: "from-black via-black/50 to-transparent",
        glowColor: "group-hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
    },
    {
        id: 2,
        title: "Special Gifts for Her",
        subtitle: "Timeless elegance to celebrate her beauty.",
        image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop",
        icon: <Heart className="w-6 h-6 text-white" />,
        link: "/shop?search=for-her",
        overlay: "from-black via-black/50 to-transparent",
        glowColor: "group-hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]"
    },
    {
        id: 3,
        title: "For Couples & Loved Ones",
        subtitle: "Perfect pairings for shared moments.",
        image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop",
        icon: <Sparkles className="w-6 h-6 text-white" />,
        link: "/shop?search=for-couples",
        overlay: "from-black via-black/50 to-transparent",
        glowColor: "group-hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
    }
];

const ShopByRecipient = () => {
    return (
        <section className="relative py-24 px-4 overflow-hidden">
            {/* Background Atmosphere - Deep Red Highlights */}
            <div className="absolute top-0 center w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-black to-black opacity-60"></div>

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">Shop by Recipient</h2>
                    <p className="text-ivory/80 text-lg font-light italic font-serif">
                        Curated collections for your most cherished connections
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6 opacity-80"></div>
                </div>

                {/* Premium Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {recipients.map((item) => (
                        <Link
                            key={item.id}
                            href={item.link}
                            className={`group relative h-[550px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-700 ease-out hover:-translate-y-2 border border-white/5 hover:border-primary/30 ${item.glowColor}`}
                        >
                            {/* Background Image */}
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />

                            {/* Dark Gradient Overlay for Readability */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${item.overlay} opacity-90 transition-opacity duration-500`}></div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>

                            {/* Red Borders/Highlight Effect */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-3xl transition-colors duration-500 pointer-events-none"></div>

                            {/* Content Container */}
                            <div className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center pb-12">

                                {/* Floating Icon with Blur */}
                                <div className="mb-6 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg transform group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 group-hover:rotate-3">
                                    {React.cloneElement(item.icon, { className: "w-6 h-6 text-white group-hover:text-white transition-colors" })}
                                </div>

                                {/* Titles */}
                                <h3 className="text-3xl font-serif text-white mb-3 tracking-wide drop-shadow-lg group-hover:text-white transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-gray-300 mb-8 max-w-xs font-light text-base leading-relaxed opacity-90">
                                    {item.subtitle}
                                </p>

                                {/* Premium Glossy CTA Button */}
                                <div className="relative overflow-hidden group/btn px-8 py-3.5 bg-gradient-to-r from-primary via-red-600 to-primary bg-[length:200%_100%] rounded-full shadow-[0_4px_20px_rgba(220,38,38,0.4)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:bg-[100%_0] border border-white/10">
                                    <div className="relative z-10 flex items-center gap-2 text-white font-medium text-sm tracking-wide uppercase">
                                        Explore Gifts
                                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </div>
                                    {/* Lustre/Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ShopByRecipient;
