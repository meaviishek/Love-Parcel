"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    // Check if we are on the auth page (or potentially other standalone pages later)
    const isAuthPage = pathname === '/auth' || pathname === '/login';

    return (
        <>
            {!isAuthPage && <Navbar />}
            {children}
            {!isAuthPage && <Footer />}
            {!isAuthPage && <MobileBottomNav />}
        </>
    );
};

export default AppLayout;
