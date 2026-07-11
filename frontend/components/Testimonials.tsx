import React from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
    {
        id: 1,
        title: "Charming Golden Jewellery",
        text: "Integer nunc viverra laoreet est the is porta pretium metus aliquam eget maecenas porta is nunc viverra Aenean pulvinar maximus. Consectetur adipiscing elit.",
        name: "Seraton Suth",
        role: "Fresh Design",
        image: "https://placehold.co/100x100/D47E53/FFF?text=SS"
    },
    {
        id: 2,
        title: "Charming Golden Jewellery",
        text: "Consectetur adipiscing elit. Integer nunc viverra laoreet est the is porta pretium metus aliquam eget maecenas porta is nunc viverra Aenean pulvinar maximus",
        name: "Alex Rony",
        role: "Fresh Design",
        image: "https://placehold.co/100x100/1A3C34/FFF?text=AR"
    },
    {
        id: 3,
        title: "Golden Bracelets",
        text: "Montluc claim to offer the finest diamond jewellery. I did my research, compared specifications with some of the big brands and now I will never walk into a store again.",
        name: "Rose Ether",
        role: "Fresh Design",
        image: "https://placehold.co/100x100/D4AF37/FFF?text=RE"
    },
    {
        id: 4,
        title: "Charming Golden Jewellery",
        text: "I did my research, compared with some of the big brands and now Aenean pulvinar maximus. Montluc claim to offer the finest diamond jewellery you can buy direct from the maker.",
        name: "Clara Weton",
        role: "Fresh Design",
        image: "https://placehold.co/100x100/333333/FFF?text=CW"
    }
];

const Testimonials = () => {
    return (
        <section className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {testimonials.map((item) => (
                    <div key={item.id} className="bg-white/5 p-8 rounded-2xl hover:shadow-md transition-shadow">
                        <div className="flex text-[#D47E53] mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill="currentColor" />
                            ))}
                        </div>
                        <h4 className="font-serif text-lg text-white mb-4">" {item.title} "</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 min-h-[80px]">
                            {item.text}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div>
                                <h5 className="font-bold text-white text-sm">{item.name}</h5>
                                <p className="text-xs text-gray-400">{item.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Testimonials;
