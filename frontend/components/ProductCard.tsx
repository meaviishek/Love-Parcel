import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';

interface ProductCardProps {
    id: string | number;
    image: string;
    title: string;
    category: string;
    price: number;
    originalPrice?: number;
    rating?: number;
    reviews?: number;
    isNew?: boolean;
    salePercentage?: number;
    description?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
    id,
    image,
    title,
    category,
    price,
    originalPrice,
    isNew,
    salePercentage,
    description
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error("Please login to add items to cart", {
                duration: 3000,
            });
            return;
        }

        // Since backend requires productId or hamperId, and assuming `id` is productId here
        try {
            await dispatch(addToCart({
                productId: id.toString(),
                quantity: 1
            })).unwrap();

            setIsAdded(true);
            toast.success("Item added to cart");
            setTimeout(() => setIsAdded(false), 2000);
        } catch (error) {
            toast.error("Failed to add item to cart");
        }
    };


    return (
        <Link href={`/shop/${id}`} className="block h-full">
            <div className="group bg-[#121212] rounded-[32px] p-3 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                {/* Image Container */}
                <div className="relative aspect-square rounded-[24px] overflow-hidden mb-4 bg-gray-900">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {salePercentage && (
                            <span className="bg-black/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                {salePercentage}% OFF
                            </span>
                        )}
                        {isNew && !salePercentage && (
                            <span className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                NEW
                            </span>
                        )}
                    </div>

                    {/* Heart Icon (Bottom Right of Image) */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            // Handle wishlist logic here
                        }}
                        className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-primary hover:text-white transition-colors z-10"
                    >
                        <Heart size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-2 pb-2 flex-1 flex flex-col">
                    <h3 className="font-serif text-sm md:text-xl text-white mb-1 md:mb-2 truncate" title={title}>
                        {title}
                    </h3>

                    {/* Simulated Description */}
                    <p className="text-gray-400 text-xs mb-3 md:mb-6 line-clamp-2 md:min-h-[2.5em] hidden md:block">
                        {description || `Elegant ${category.toLowerCase()} crafted for modern sophistication and timeless style.`}
                    </p>

                    {/* Footer: Price & Button */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-auto gap-2 md:gap-0">
                        <div className="flex flex-col">
                            {originalPrice && (
                                <span className="text-gray-500 text-[10px] md:text-xs line-through">
                                    Rs. {originalPrice.toLocaleString()}
                                </span>
                            )}
                            <span className="text-white font-bold text-sm md:text-lg">
                                Rs. {price.toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`w-full md:w-auto px-3 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 z-10 ${isAdded
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-white text-black hover:bg-gray-200'
                                }`}
                        >
                            {isAdded ? (
                                <>
                                    <Check size={16} />
                                    <span>Added</span>
                                </>
                            ) : (
                                <>
                                    {/* <ShoppingBag size={16} /> // Optional to add icon */}
                                    <span>Add to Cart</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;

