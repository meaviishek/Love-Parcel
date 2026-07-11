"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { Heart, Gift, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { googleLogin } from '@/store/slices/authSlice';

const AuthContent = () => {
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/';

    useEffect(() => {
        setMounted(true);
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    const handleGoogleLogin = () => {
        // Pass current path or custom redirect if needed
        dispatch(googleLogin(redirectPath));
    };

    return (
        <div className="min-h-screen relative bg-black overflow-hidden flex items-center justify-center p-4">
            {/* Background Animations */}
            <div className="absolute inset-0 z-0">
                <div className={`absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] transition-transform duration-[3000ms] ${mounted ? 'translate-x-0 translate-y-0 opacity-100' : '-translate-x-full -translate-y-full opacity-0'}`}></div>
                <div className={`absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] transition-transform duration-[3000ms] delay-500 ${mounted ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-full translate-y-full opacity-0'}`}></div>

                {/* Floating Hearts/Gifts - Simplified CSS animation via style tag or classes if config allows, here utilizing layout */}
                <div className="absolute top-1/4 left-1/4 animate-bounce duration-[3s]">
                    <Heart className="text-primary/20 w-12 h-12" fill="currentColor" />
                </div>
                <div className="absolute bottom-1/3 right-1/4 animate-bounce duration-[4s]">
                    <Gift className="text-secondary/20 w-16 h-16" />
                </div>
                <div className="absolute top-1/3 right-1/3 animate-pulse">
                    <Sparkles className="text-white/10 w-8 h-8" />
                </div>
            </div>

            {/* Main Card */}
            <div className={`relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary mb-6 shadow-lg shadow-primary/30">
                        <Gift className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Welcome to LuxeLoom</h1>
                    <p className="text-gray-400 text-sm">Join our world of exquisite gifting</p>
                </div>

                {/* Login Button */}
                <button
                    onClick={handleGoogleLogin}
                    className="group w-full relative flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    <span className="text-lg">Continue with Google</span>
                    <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gray-400 absolute right-6" />
                </button>

                {/* Back to Home Button */}
                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-gray-500">
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>

                    <Link href="/" className="inline-flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

const AuthPage = () => {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <AuthContent />
        </Suspense>
    );
};

export default AuthPage;
