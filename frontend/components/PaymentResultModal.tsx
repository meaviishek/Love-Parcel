"use client";
import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RefreshCw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PaymentResultModalProps {
    isOpen: boolean;
    status: 'success' | 'failed';
    title: string;
    message: string;
    orderId?: string;
    onClose: () => void;
    onRetry?: () => void;
}

const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
    isOpen,
    status,
    title,
    message,
    orderId,
    onClose,
    onRetry
}) => {

    useEffect(() => {
        if (isOpen && status === 'success') {
            // Trigger confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen, status]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="bg-[#121212] border border-gray-800 rounded-[32px] p-8 max-w-md w-full text-center relative z-10 shadow-2xl shadow-primary/10"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex flex-col items-center">
                            {/* Icon Animation */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", duration: 0.8, bounce: 0.5, delay: 0.2 }}
                                className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${status === 'success'
                                    ? 'bg-gradient-to-tr from-green-500/20 to-emerald-500/20 text-green-500'
                                    : 'bg-gradient-to-tr from-red-500/20 to-rose-500/20 text-red-500'
                                    }`}
                            >
                                {status === 'success' ? (
                                    <CheckCircle2 size={48} strokeWidth={3} />
                                ) : (
                                    <XCircle size={48} strokeWidth={3} />
                                )}
                            </motion.div>

                            {/* Content */}
                            <motion.h2
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-serif font-bold text-white mb-3"
                            >
                                {title}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-gray-400 mb-8 leading-relaxed"
                            >
                                {message}
                            </motion.p>

                            {orderId && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-gray-900/50 rounded-2xl py-4 px-8 mb-8 border border-gray-800 w-full"
                                >
                                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-bold">Order ID</p>
                                    <p className="text-white font-mono text-lg font-medium tracking-wide">{orderId}</p>
                                </motion.div>
                            )}

                            {/* Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-4 w-full"
                            >
                                {status === 'success' ? (
                                    <>
                                        <Link
                                            href={ '/myaccount'}
                                            className="w-full bg-primary text-black py-4 rounded-full font-bold text-lg hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            View Order <ArrowRight size={20} />
                                        </Link>
                                        <Link
                                            href="/shop"
                                            className="w-full bg-gray-900 text-white py-4 rounded-full font-bold text-base hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag size={18} /> Continue Shopping
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {onRetry && (
                                            <button
                                                onClick={onRetry}
                                                className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                                            >
                                                Try Again <RefreshCw size={20} />
                                            </button>
                                        )}
                                        <button
                                            onClick={onClose}
                                            className="block w-full text-gray-500 hover:text-white py-2 transition-colors text-sm"
                                        >
                                            Close
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PaymentResultModal;
