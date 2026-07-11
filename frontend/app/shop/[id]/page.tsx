"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Minus, Plus, ShoppingBag, Star, Heart, Share2,
    Truck, ShieldCheck, RefreshCw, ChevronRight, ArrowLeft
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Skeleton from '@/components/ui/Skeleton';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { fetchProductById } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { addProductItem } from '@/store/slices/hamperSlice';
import { toast } from 'sonner';

const ProductDetailsPage = () => {
    const params = useParams();
    const router = useRouter(); // Use useRouter
    const dispatch = useDispatch<AppDispatch>();
    const { selectedProduct: product, loading } = useSelector((state: RootState) => state.product);
    const { user } = useSelector((state: RootState) => state.auth);

    const productId = params?.id && !Array.isArray(params.id) ? params.id : null;

    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(productId));
        }
    }, [dispatch, productId]);

    // Find Related Products (random 4 for now - Placeholder until we have related products API)
    // For now showing empty or loading logic if needed
    const relatedProducts: any[] = [];
    // const relatedProducts = products
    //     .filter(p => p.id !== productId)
    //     .slice(0, 4)
    //     .map(p => ({ ...p, image: p.images[0] }));

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
    const [isAdded, setIsAdded] = useState(false);

    // Customization State
    const [customNote, setCustomNote] = useState('');
    const [driveLink, setDriveLink] = useState('');


    const handleAddToCart = async () => {
        if (!product) return;

        if (!user) {
            toast.error("Please login to add items to cart", {
                duration: 3000,
            });
            return;
        }

        try {
            await dispatch(addToCart({
                productId: product.id,
                quantity: quantity,
                customization: (customNote || driveLink) ? {
                    note: customNote,
                    imageLinks: driveLink ? [driveLink] : []
                } : undefined
            })).unwrap();

            setIsAdded(true);
            toast.success("Item added to cart");
            setTimeout(() => setIsAdded(false), 2000);
        } catch (error) {
            toast.error("Failed to add item to cart");
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;

        if (!user) {
            toast.error("Please login to buy items", {
                duration: 3000,
            });
            return;
        }

        try {
            await dispatch(addToCart({
                productId: product.id,
                quantity: quantity,
                customization: (customNote || driveLink) ? {
                    note: customNote,
                    imageLinks: driveLink ? [driveLink] : []
                } : undefined
            })).unwrap();

            toast.success("Proceeding to checkout");
            router.push('/checkout');
        } catch (error) {
            toast.error("Failed to process buy now request");
        }
    };


    const handleAddToHamper = () => {
        if (!product) return;
        dispatch(addProductItem({ id: product.id, qty: quantity }));
        toast.success("Added to Hamper Cart");
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white">
                <div className="pt-4 pb-4 border-b border-gray-900">
                    <div className="container mx-auto px-4">
                        <Skeleton className="h-6 w-48" />
                    </div>
                </div>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-12">
                        <div className="lg:w-1/2 space-y-4">
                            <Skeleton className="aspect-4/5 md:aspect-square w-full rounded-[32px]" />
                            <div className="flex gap-4">
                                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-20 h-20 rounded-2xl" />)}
                            </div>
                        </div>
                        <div className="lg:w-1/2 flex flex-col gap-6">
                            <Skeleton className="h-6 w-32 rounded-full" />
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-10 w-48" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                            <div className="h-px bg-gray-900 my-4" />
                            <div className="flex gap-4">
                                <Skeleton className="h-14 w-full rounded-full" />
                                <Skeleton className="h-14 w-full rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-black text-white flex flex-col justify-between">
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-4">Product Not Found</h1>
                    <p className="text-gray-400 mb-8">The product you are looking for does not exist.</p>
                    <Link href="/shop" className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-light transition-colors">
                        Browse Shop
                    </Link>
                </div>

            </main>
        );
    }

    // Ensure images array has at least one image
    const productImages = product.images.length > 0 ? product.images : ["/placeholder.png"];

    return (
        <main className="min-h-screen bg-black text-white">

            {/* Breadcrumbs */}
            <div className="pt-4 pb-4 border-b border-gray-900">
                <div className="container mx-auto px-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight size={14} className="mx-2" />
                        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                        <ChevronRight size={14} className="mx-2" />
                        <span className="text-white truncate max-w-[200px]">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Left Column: Image Gallery */}
                    <div className="lg:w-1/2 space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-4/5 md:aspect-square w-full rounded-[32px] overflow-hidden bg-[#121212] border border-gray-900 group">
                            <Image
                                src={productImages[activeImage]}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                            />
                            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-white transition-all">
                                <Heart size={20} />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                            {productImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImage(index)}
                                    className={`relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <Image src={img} alt={`View ${index + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: details */}
                    <div className="lg:w-1/2 flex flex-col">
                        <div className="mb-2 flex items-center gap-2">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                {product.category?.name || "Uncategorized"}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">
                            {product.name}
                        </h1>

                        <div className="flex items-end gap-4 mb-8">
                            {product.originalPrice && (
                                <span className="text-2xl text-gray-500 line-through mb-1">Rs. {product.originalPrice.toLocaleString()}</span>
                            )}
                            <span className="text-4xl font-bold text-primary">Rs. {product.price.toLocaleString()}</span>
                        </div>

                        <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                            {product.description}
                        </p>

                        {/* Actions */}
                        <div className="space-y-6 pt-6 border-t border-gray-900">
                            {/* Customization Inputs */}
                            <div className="space-y-4">
                                {product.productType === 'HAMPER' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Custom Note (Optional)</label>
                                        <textarea
                                            value={customNote}
                                            onChange={(e) => setCustomNote(e.target.value)}
                                            placeholder="Add a personal note for the recipient..."
                                            className="w-full bg-[#121212] border border-gray-800 rounded-lg p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                                        />
                                    </div>
                                )}
                                {product.requiresImage && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Google Drive Link for Images (Optional)</label>
                                        <input
                                            type="text"
                                            value={driveLink}
                                            onChange={(e) => setDriveLink(e.target.value)}
                                            placeholder="Paste Google Drive link here..."
                                            className="w-full bg-[#121212] border border-gray-800 rounded-lg p-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-6">
                                <span className="text-sm font-medium text-gray-400">Quantity</span>
                                <div className="flex items-center gap-4 bg-[#121212] rounded-full px-4 py-2 border border-gray-800">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    className={`flex-1 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${isAdded
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-black hover:bg-gray-200'
                                        }`}
                                >
                                    <ShoppingBag size={20} />
                                    {isAdded ? 'Added to Cart' : 'Add to Cart'}
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-primary text-white py-4 rounded-full font-bold text-lg hover:bg-primary-light transition-colors shadow-lg shadow-primary/20"
                                >
                                    Buy Now
                                </button>
                            </div>

                            <button
                                onClick={handleAddToHamper}
                                className="w-full py-4 rounded-full font-bold text-lg border border-primary text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={20} />
                                Add to Hamper Box
                            </button>

                            {/* Features / Services */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-white">
                                        <Truck size={18} />
                                    </div>
                                    <span>Free Shipping<br />On orders over Rs. 999</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-white">
                                        <RefreshCw size={18} />
                                    </div>
                                    <span>Easy Returns<br />7 Days Policy</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-white">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <span>Secure Payment<br />Encrypted Transactions</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <div className="w-10 h-10 rounded-full bg-[#121212] flex items-center justify-center text-white">
                                        <Share2 size={18} />
                                    </div>
                                    <span>Share Product<br />With friends</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mt-20">
                    <div className="flex items-center gap-8 border-b border-gray-900 mb-8">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`pb-4 text-lg font-medium transition-colors relative ${activeTab === 'description' ? 'text-primary' : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            Description
                            {activeTab === 'description' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                            )}
                        </button>
                    </div>

                    <div className="min-h-[200px]">
                        {activeTab === 'description' && (
                            <div className="grid md:grid-cols-2 gap-12 animate-fadeIn">
                                <div>
                                    <h3 className="text-xl font-serif font-bold mb-4">Product Details</h3>
                                    <p className="text-gray-400 leading-relaxed mb-6">
                                        {product.description}
                                    </p>
                                </div>
                                <div className="bg-[#121212] rounded-2xl p-6">
                                    <h3 className="text-xl font-serif font-bold mb-4">Specifications</h3>
                                    <div className="space-y-4">
                                        {product.specifications && Object.keys(product.specifications).length > 0 ? (
                                            Object.entries(product.specifications).map(([key, value]) => (
                                                <div key={key} className="flex justify-between border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                                                    <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                                    <span className="font-medium text-right">{String(value)}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500">No specifications available</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                <div className="mt-24 border-t border-gray-900 pt-12">
                    {/* Placeholder for related products */}
                </div>

            </div>


        </main>
    );
};

export default ProductDetailsPage;
