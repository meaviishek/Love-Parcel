"use client";

import React from 'react';
import { Facebook, Twitter, Linkedin, ArrowUp } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-black pt-16 pb-8 border-t border-gray-900">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            {/* Logo Placeholder */}
                            <div className="relative h-12 w-40">
                                <img
                                    src="/LOGO.png"
                                    alt="LuxeLoom"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Lorem ipsum dolor sit amet, conse elit, sedid do eiusmod tempor incidi ut labore et dolore magna aliqua. Quis ipsum usendi laboris mollit
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                <Facebook size={14} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                <Twitter size={14} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                <Linkedin size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Shop Online */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Shop Online</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">Jewellery Materials</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Sizing Children's Jewellery</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Delivery & Returns</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Order Tracking</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Categories</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">Rings</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Accessories</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Earrings</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Gold Buckle</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Bracelets</Link></li>
                        </ul>
                    </div>

                    {/* Information */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Information</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-primary transition-colors">Order Tracking</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">Tutorials</Link></li>
                            <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Need Help */}
                    <div>
                        <h4 className="font-bold text-white mb-6">Need Help?</h4>
                        <div className="space-y-4 text-sm text-gray-500">
                            <p>
                                <span className="font-bold text-white">Head Office:</span> 785 15h Street, Office 478 Berlin, De 81566
                            </p>
                            <p>
                                <span className="font-bold text-white">Tel:</span> 0123456778
                            </p>
                            <p>
                                <span className="font-bold text-white">Email:</span> hello@olight-jewelry.com
                            </p>
                        </div>
                    </div>
                </div>

                {/* Copyright Bar */}
                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        Copyright © 2025 <span className="text-secondary">Olight</span>. All Rights Reserved
                    </p>

                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white hover:border-primary transition-all"
                    >
                        <ArrowUp size={16} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
