"use client";

import Hero from "@/components/Hero";
import ShopByRecipient from "@/components/ShopByRecipient";
import ShopByPrice from "@/components/ShopByPrice";
import LatestProducts from "@/components/LatestProducts";
import TrendingProducts from "@/components/TrendingProducts";
import AdBanners from "@/components/AdBanners";
import ScrollingMarquee from "@/components/ScrollingMarquee";
import HandmadeBanner from "@/components/HandmadeBanner";
import Testimonials from "@/components/Testimonials";
import CollectionBanner from "@/components/CollectionBanner";
import InstagramFeed from "@/components/InstagramFeed";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { fetchProducts } from "@/store/slices/productSlice";
import { fetchCategories } from "@/store/slices/categorySlice";

export default function Home() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(fetchProducts());
        dispatch(fetchCategories());
    }, [dispatch]);

    return (
        <main className="min-h-screen bg-black">
            <Hero />
            <ShopByPrice />
            <ShopByRecipient />

            <LatestProducts />
            <TrendingProducts />
            <AdBanners />
            <ScrollingMarquee />
            <HandmadeBanner />
            <Testimonials />
            <CollectionBanner />
            <InstagramFeed />
        </main>
    );
}
