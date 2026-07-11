import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AdBanners = () => {
    return (
        <section className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Banner 1: Necklace */}
                <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[#0a0a0a]">
                        <Image
                            src="https://placehold.co/800x600/0a0a0a/D4AF37?text=Necklace+Collection"
                            alt="Best Friend Jewelry"
                            fill
                            className="object-cover object-right md:object-center group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 items-start">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Luxury Necklace</p>
                        <h3 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight">
                            Best Friend <br /> Jewelry
                        </h3>
                        <p className="text-gray-400 text-sm mb-8 max-w-[200px]">
                            A wide range of exquisite earrings
                        </p>
                        <Link href="/shop/necklace" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-white hover:text-black transition-colors">
                            Shop Now
                        </Link>
                    </div>
                </div>

                {/* Banner 2: Earrings */}
                <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden group">
                    <div className="absolute inset-0 bg-[#0a0a0a]">
                        <Image
                            src="https://placehold.co/800x600/0a0a0a/D4AF37?text=Diamond+Earrings"
                            alt="Diamond Stud Earrings"
                            fill
                            className="object-cover object-right md:object-center group-hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                    <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 items-start">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Our Earrings</p>
                        <h3 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight">
                            Diamond Stud <br /> Earrings
                        </h3>
                        <p className="text-gray-400 text-sm mb-8 max-w-[200px]">
                            A wide range of exquisite earrings
                        </p>
                        <Link href="/shop/earrings" className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-white hover:text-black transition-colors">
                            Shop Now
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AdBanners;
