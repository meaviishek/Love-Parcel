"use client";

import React from 'react';
import { Circle, Gem, Watch, Diamond, Anchor, Link as LinkIcon, Printer, Gamepad2, Cookie, Flower2, Cake, Gift, Mail, Grape, Sparkles, Package } from 'lucide-react';
import Link from 'next/link';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCategories, Category } from '@/store/slices/categorySlice';

export const iconMapping = [
    { name: 'Rings', icon: <Circle size={18} /> },
    { name: 'Necklace', icon: <Diamond size={18} /> },
    { name: 'Earring', icon: <Gem size={18} /> },
    { name: 'Bracelet', icon: <Circle size={18} /> },
    { name: 'Brooch', icon: <Gem size={18} /> },
    { name: 'Polki Jewellery', icon: <Diamond size={18} /> },
    { name: 'Cufflink', icon: <Watch size={18} /> },
    { name: 'Pearls', icon: <Circle size={18} /> },
    { name: 'Piercing', icon: <Gem size={18} /> },
    { name: 'Platinum', icon: <Anchor size={18} /> },
    { name: 'Navratna', icon: <Diamond size={18} /> },
    { name: 'Chain', icon: <LinkIcon size={18} /> },
    // New Categories
    { name: 'Jewellery', icon: <Gem size={18} /> },
    { name: 'Printings', icon: <Printer size={18} /> },
    { name: 'Toys', icon: <Gamepad2 size={18} /> },
    { name: 'Chocolates', icon: <Cookie size={18} /> },
    { name: 'Flowers', icon: <Flower2 size={18} /> },
    { name: 'Cakes', icon: <Cake size={18} /> },
    { name: 'Personalized Gifts', icon: <Gift size={18} /> },
    { name: 'Greeting Cards', icon: <Mail size={18} /> },
    { name: 'Dry Fruits', icon: <Grape size={18} /> },
    { name: 'Perfumes', icon: <Sparkles size={18} /> },
    { name: 'Gift Hampers', icon: <Package size={18} /> },
];

interface CategoryListProps {
    className?: string; // Wrapper className
    itemClassName?: string; // Li or Link className
    onCategoryClick?: () => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ className = "", itemClassName = "", onCategoryClick }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { categories: fetchedCategories, loading } = useSelector((state: RootState) => state.category);

    React.useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Map DB categories to icons if name matches, else default
    const mergedCategories = fetchedCategories.map((cat: Category) => {
        const found = iconMapping.find(i => i.name.toLowerCase() === cat.name.toLowerCase());
        return {
            ...cat,
            icon: found ? found.icon : <Circle size={18} /> // Default icon
        };
    });

    if (loading && mergedCategories.length === 0) {
        return <div className="p-4 text-gray-500 text-sm">Loading categories...</div>;
    }

    return (
        <ul className={`py-2 ${className}`}>
            {mergedCategories.map((cat: Category & { icon: React.ReactNode }, index: number) => (
                <li key={cat.id || index}>
                    <Link
                        href={`/shop?category=${cat.slug || cat.name.toLowerCase()}`}
                        className={`flex items-center gap-3 px-6 py-3 hover:bg-white/5 text-gray-400 hover:text-primary transition-colors group ${itemClassName}`}
                        onClick={onCategoryClick}
                    >
                        <span className="text-gray-400 group-hover:text-primary transition-colors">
                            {cat.icon}
                        </span>
                        <span className="text-sm font-medium capitalize">{cat.name}</span>
                    </Link>
                </li>
            ))}
            {mergedCategories.length === 0 && !loading && (
                <li className="px-6 py-3 text-gray-500 text-sm">No categories found</li>
            )}
        </ul>
    );
};

export default CategoryList;
