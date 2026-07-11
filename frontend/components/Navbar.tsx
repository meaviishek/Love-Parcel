"use client"
import React from 'react';
import { Search, ShoppingBag, User, Menu, ChevronRight, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
// import { useCart } from '@/context/CartContext'; // Removing Context usage

import CategoryList from './CategoryList';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCart } from '@/store/slices/cartSlice';



const ActiveHamperIndicator = () => {
    const { hamperItems, productItems } = useSelector((state: RootState) => state.hamper);
    const count = Object.values(hamperItems).reduce((a, b) => a + b, 0) + Object.values(productItems).reduce((a, b) => a + b, 0);

    if (count === 0) return null;

    return (
        <Link href="/custom-hamper" className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors animate-pulse">
            <ShoppingBag size={20} />
            <span className="hidden sm:inline font-medium">Hamper ({count})</span>
        </Link>
    );
};

const Navbar = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const { items } = useSelector((state: RootState) => state.cart);
    const dispatch = useDispatch<AppDispatch>();

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const pathname = usePathname();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            dispatch(fetchCart());
        }
    }, [dispatch, user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCategoriesOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close dropdown on route change (optional, but helps if navigation happens)
    const router = useRouter();

    useEffect(() => {
        setIsCategoriesOpen(false);
    }, [pathname]);

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className="w-full bg-black shadow-sm z-50 sticky top-0">
            {/* Top Bar */}
            <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="relative h-12 w-40">
                        <img
                            src="/LOGO.png"
                            alt="LuxeLoom"
                            className="object-contain w-full h-full"
                        />
                    </div>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl hidden md:block">
                    <form onSubmit={handleSearchSubmit} className="relative">
                        <input
                            type="text"
                            placeholder="Search your favourite products"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-3 rounded-full border border-gray-800 focus:outline-none focus:border-primary bg-white/5 text-white placeholder:text-gray-400 text-sm"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-primary-light transition-colors">
                            <Search size={18} />
                        </button>
                    </form>
                </div>

                {/* Account & Cart */}
                <div className="flex items-center gap-6 text-sm font-medium text-white">
                    {user ? (
                        <Link href="/myaccount" className="flex items-center gap-2 hover:text-primary transition-colors">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-700"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                    <User size={16} />
                                </div>
                            )}
                            <span className="hidden sm:inline max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                        </Link>
                    ) : (
                        <Link href="/auth" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <User size={20} />
                            <span className="hidden sm:inline">Login / Register</span>
                        </Link>
                    )}
                    <Link href="/cart" className="flex items-center gap-2 hover:text-primary transition-colors relative">
                        <div className="relative">
                            <ShoppingBag size={20} />
                            <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">{totalItems}</span>
                        </div>
                        <span className="hidden sm:inline">Your Cart</span>
                    </Link>

                    {/* Active Hamper Indicator (if items exist) */}
                    <ActiveHamperIndicator />
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-primary text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-12">
                      

                        {/* Main Nav Links */}
                        <nav className="hidden md:flex items-center gap-8 flex-1 px-8">
                            <Link href="/" className="hover:text-secondary transition-colors font-medium">Home</Link>
                            <Link href="/categories" className="hover:text-secondary transition-colors font-medium">Categories</Link>
                            <Link href="/shop" className="hover:text-secondary transition-colors font-medium">Shop</Link>



                        </nav>

                        {/* Contact */}
                        <Link href="/contact" className="hidden md:flex items-center gap-2 hover:text-secondary transition-colors text-sm font-medium">
                            <span>Contact Us</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
