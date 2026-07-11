"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5051/api/";

export interface CartItem {
    id: string | number;
    title: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string | number) => void;
    updateQuantity: (id: string | number, change: number) => void;
    clearCart: () => void;
    totalItems: number;
    subtotal: number;

    // Coupon
    couponCode: string | null;
    discountAmount: number;
    couponError: string | null;
    applyCoupon: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
    finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Load from local storage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (error) {
                console.error("Failed to parse cart from local storage", error);
            }
        }
    }, []);

    // Save to local storage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));

        // Re-validate coupon if cart changes (in case total drops below min or items removed)
        if (couponCode) {
            applyCoupon(couponCode);
        }
    }, [cartItems]); // Be careful with infinite loops here. applyCoupon updates state.

    const addToCart = (item: CartItem) => {
        setCartItems(prev => {
            const existingItem = prev.find(i => i.id === item.id);
            if (existingItem) {
                return prev.map(i =>
                    i.id === item.id
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (id: string | number) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string | number, change: number) => {
        setCartItems(prev => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const clearCart = () => {
        setCartItems([]);
        setCouponCode(null);
        setDiscountAmount(0);
        setCouponError(null);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const applyCoupon = async (code: string): Promise<boolean> => {
        setCouponError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}coupons/validate`, {
                code,
                cartAmount: subtotal,
                cartItems
            });

            if (response.data.success) {
                setCouponCode(response.data.data.code);
                setDiscountAmount(response.data.data.discountAmount);
                return true;
            } else {
                setCouponError(response.data.message || "Invalid coupon");
                setDiscountAmount(0);
                setCouponCode(null);
                return false;
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || "Failed to apply coupon";
            setCouponError(msg);
            setDiscountAmount(0);
            // Don't clear code if it's just a validation error regarding amount,
            // but maybe we should if implementation requires.
            // For now, clear code on error
            setCouponCode(null);
            return false;
        }
    };

    const removeCoupon = () => {
        setCouponCode(null);
        setDiscountAmount(0);
        setCouponError(null);
    };

    const finalTotal = Math.max(0, subtotal - discountAmount);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems: cartItems.reduce((acc, item) => acc + item.quantity, 0),
            subtotal,
            couponCode,
            discountAmount,
            couponError,
            applyCoupon,
            removeCoupon,
            finalTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
