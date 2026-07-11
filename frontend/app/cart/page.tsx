"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchCart, removeFromCart, updateCartItem } from '@/store/slices/cartSlice';

const CartPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: cartItems, loading } = useSelector((state: RootState) => state.cart);
    const { user } = useSelector((state: RootState) => state.auth);

    // Coupon State
    const [couponCode, setCouponCode] = useState<string | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [inputCode, setInputCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleUpdateQuantity = (itemId: string, change: number) => {
        const item = cartItems.find(i => i.id === itemId);
        if (item) {
            const newQuantity = item.quantity + change;
            if (newQuantity >= 1) {
                dispatch(updateCartItem({ itemId, quantity: newQuantity }));
            }
        }
    };

    const handleRemoveFromCart = (itemId: string) => {
        dispatch(removeFromCart(itemId));
    };

    // Derived Calculations
    const subtotal = cartItems.reduce((acc, item) => {
        const price = item.price || item.details?.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    const shipping = subtotal > 2000 ? 0 : 200;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const total = finalTotal + shipping;

    const handleApplyCoupon = async () => {
        if (!inputCode.trim()) return;
        setIsApplying(true);
        // Mock coupon logic for now
        // In real app, dispatch an action or call API
        setIsApplying(false);
    };

    const removeCoupon = () => {
        setCouponCode(null);
        setDiscountAmount(0);
    }

    if (cartItems.length === 0) {
        return (
            <main className="min-h-screen bg-black">
                <div className="text-white pt-32 pb-20 px-4 flex flex-col items-center justify-center">
                    <div className="bg-[#121212] p-8 rounded-[32px] text-center max-w-md w-full border border-gray-800">
                        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag size={32} className="text-gray-500" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold mb-4">Your Cart is Empty</h2>
                        <p className="text-gray-400 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-light transition-colors"
                        >
                            Start Shopping <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black">
            <div className="text-white pt-10 pb-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-12 text-center md:text-left">Your Cart</h1>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-6">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-[#121212] rounded-[24px] p-4 flex gap-4 md:gap-6 items-center border border-gray-900 hover:border-gray-800 transition-colors"
                                >
                                    {/* Image */}
                                    <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden bg-gray-800">
                                        <Image
                                            src={item.details?.images?.[0] || "/placeholder.jpg"}
                                            alt={item.details?.name || "Product"}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-gray-400 text-xs md:text-sm mb-1">{item.details?.category?.name || "Uncategorized"}</p>
                                                <h3 className="font-serif text-lg md:text-xl font-bold truncate pr-4">{item.details?.name || "Unknown Product"}</h3>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.id)}
                                                className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mt-4 gap-4">
                                            <div className="flex items-center gap-3 bg-black rounded-full px-3 py-1 border border-gray-800">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, -1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors text-xs"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.id, 1)}
                                                    className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors text-xs"
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                            <p className="text-xl font-bold text-primary">Rs. {((item.details?.price || 0) * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-96 flex-shrink-0">
                            <div className="bg-[#121212] rounded-[32px] p-6 sticky top-24 border border-gray-900">
                                <h2 className="text-2xl font-serif font-bold mb-6">Order Summary</h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="text-white font-medium">Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-400">
                                        <span>Shipping</span>
                                        <span className={shipping === 0 ? "text-green-500 font-medium" : "text-white font-medium"}>
                                            {shipping === 0 ? "Free" : `Rs. ${shipping}`}
                                        </span>
                                    </div>

                                    {/* Coupon Section */}
                                    <div className="pt-4 border-t border-gray-800">
                                        {!couponCode ? (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Coupon Code"
                                                        className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary uppercase"
                                                        value={inputCode}
                                                        onChange={(e) => setInputCode(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleApplyCoupon}
                                                        disabled={isApplying || !inputCode}
                                                        className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        {isApplying ? '...' : 'Apply'}
                                                    </button>
                                                </div>
                                                {couponError && (
                                                    <p className="text-red-500 text-xs">{couponError}</p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex justify-between items-center">
                                                <div>
                                                    <p className="text-green-500 text-sm font-bold flex items-center gap-1">
                                                        Code: {couponCode}
                                                    </p>
                                                    <p className="text-green-400 text-xs">
                                                        Discount applied
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        removeCoupon();
                                                        setInputCode('');
                                                    }}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Discount Row */}
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-green-500 pt-2">
                                            <span>Discount</span>
                                            <span className="font-medium">- Rs. {discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}

                                    <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-2xl text-primary">Rs. {total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link href="/checkout" className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                    Checkout <ArrowRight size={20} />
                                </Link>

                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Secure Checkout - 100% Money Back Guarantee
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CartPage;
