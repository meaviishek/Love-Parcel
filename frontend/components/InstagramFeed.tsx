import React from 'react';
import Image from 'next/image';

const images = [
    "https://placehold.co/400x400/F5F5F5/D4AF37?text=Jewelry+1",
    "https://placehold.co/400x400/F9F6F0/D4AF37?text=Jewelry+2",
    "https://placehold.co/400x400/FFF/D4AF37?text=Jewelry+3",
    "https://placehold.co/400x400/F5F5F5/D4AF37?text=Jewelry+4",
    "https://placehold.co/400x400/F9F6F0/D4AF37?text=Jewelry+5",
    "https://placehold.co/400x400/FFF/D4AF37?text=Jewelry+6",
];

const InstagramFeed = () => {
    return (
        <section className="w-full py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 px-4">
                {images.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer">
                        <Image
                            src={src}
                            alt={`Instagram post ${index + 1}`}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default InstagramFeed;
