"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Grid, User, X } from 'lucide-react';


const MobileBottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        { icon: Home, label: 'Home', href: '/' },
        { icon: ShoppingBag, label: 'Shop', href: '/shop' },
        { icon: User, label: 'Profile', href: '/account' },
    ];

    return (
        <div className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-900 z-50 md:hidden pb-safe">
            <div className="flex items-center justify-around h-16">
                {/* Home */}
                <Link
                    href="/"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Home size={20} />
                    <span className="text-[10px] font-medium">Home</span>
                </Link>

                {/* Shop */}
                <Link
                    href="/shop"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/shop' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <ShoppingBag size={20} />
                    <span className="text-[10px] font-medium">Shop</span>
                </Link>

                {/* Categories */}
                <Link
                    href="/categories"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/categories' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <Grid size={20} />
                    <span className="text-[10px] font-medium">Categories</span>
                </Link>

                {/* Profile */}
                <Link
                    href="/account"
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/account' ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <User size={20} />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </div>
        </div>
    );
};

export default MobileBottomNav;
