"use client";

import React from 'react';
import { Sun } from 'lucide-react';

const ScrollingMarquee = () => {
  return (
    <div className="w-full bg-black py-8 overflow-hidden border-t border-b border-gray-900">
      <div className="flex whitespace-nowrap animate-scroll">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 mx-8 text-white font-medium text-lg">
            <span>Free Shipping Over ₹240 For Members</span>
            <Sun className="text-secondary fill-secondary" size={20} />
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ScrollingMarquee;
