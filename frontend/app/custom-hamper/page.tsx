"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, ChevronRight, ChevronLeft, Check, Plus, Minus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Skeleton from '@/components/ui/Skeleton';
import { addToCart } from '@/store/slices/cartSlice';
import { fetchProducts } from '@/store/slices/productSlice';
import { AppDispatch, RootState } from '@/store/store';
import {
    selectBox,
    addHamperItem,
    addProductItem,
    updateNote,
    addImageLink,
    removeImageLink,
    setItemCustomization,
    clearHamper,
    syncHamperItem,
    fetchHamperDraft,
    fetchHamperBoxes,
    fetchHamperItems,
    createHamper
} from '@/store/slices/hamperSlice';

// Types
interface HamperBox {
    id: string;
    name: string;
    minItems: number;
    basePrice: number;
    image?: string;
}

interface HamperItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    isAvailable: boolean;
    requiresImage?: boolean;
    productType?: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    images: string[];
    requiresImage?: boolean;
    productType?: string;
}

const CustomHamperPage = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);

    // Redux State
    const {
        selectedBox,
        hamperItems: selectedHamperItems,
        productItems: selectedProducts,
        note,
        imageLinks,
        itemCustomizations,
        boxes,
        availableItems: hamperItemsList
    } = useSelector((state: RootState) => state.hamper);

    const { products: shopProducts } = useSelector((state: RootState) => state.product);

    // Steps: 1 = Add Items, 2 = Select Box, 3 = Review
    const [step, setStep] = useState(1);

    const [loading, setLoading] = useState(true);

    // Local state for inputs in Review step
    const [currNote, setCurrNote] = useState(note);
    const [currLink, setCurrLink] = useState('');

    useEffect(() => {
        const initData = async () => {
            try {
                await Promise.all([
                    dispatch(fetchHamperBoxes()),
                    dispatch(fetchHamperItems()),
                    dispatch(fetchProducts({}))
                ]);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, [dispatch]);

    // Use shopProducts from Redux store instead of local fetching

    useEffect(() => {
        setCurrNote(note);
    }, [note]);

    const handleBoxSelect = (box: HamperBox) => {
        dispatch(selectBox(box));
    };

    const handleItemChange = async (itemId: string, delta: number) => {
        dispatch(addHamperItem({ id: itemId, qty: delta }));

        if (user) {
            dispatch(syncHamperItem({ productId: itemId, delta, userId: user.id }));
        }
    };

    const handleProductChange = (productId: string, delta: number) => {
        dispatch(addProductItem({ id: productId, qty: delta }));

        if (user) {
            dispatch(syncHamperItem({ productId, delta, userId: user.id }));
        }
    };

    // Derived Totals
    const totalHamperItemsCount = Object.values(selectedHamperItems).reduce((a, b) => a + b, 0);
    const totalProductItemsCount = Object.values(selectedProducts).reduce((a, b) => a + b, 0);
    const totalItemsCount = totalHamperItemsCount + totalProductItemsCount;

    // Persistence: Load from Local Storage on mount or Server if logged in
    useEffect(() => {
        if (user) {
            dispatch(fetchHamperDraft(user.id)).unwrap().then((draft: any) => {
                if (draft && draft.items && draft.items.length > 0) {
                    toast.success("Loaded saved hamper draft");
                }
            }).catch((e: any) => console.error(e));
        } else {
            const saved = localStorage.getItem('hamper_state');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.selectedBox) dispatch(selectBox(parsed.selectedBox));
                    if (parsed.note) dispatch(updateNote(parsed.note));
                    if (parsed.imageLinks) parsed.imageLinks.forEach((l: string) => dispatch(addImageLink(l)));
                    // Hydrate items
                    Object.entries(parsed.hamperItems || {}).forEach(([id, qty]) => {
                        dispatch(addHamperItem({ id, qty: qty as number }));
                    });
                    Object.entries(parsed.productItems || {}).forEach(([id, qty]) => {
                        dispatch(addProductItem({ id, qty: qty as number }));
                    });
                    // Hydrate customizations
                    if (parsed.itemCustomizations) {
                        Object.entries(parsed.itemCustomizations).forEach(([pid, custs]) => {
                            (custs as any[]).forEach((c, idx) => {
                                dispatch(setItemCustomization({ id: pid, index: idx, note: c.note, images: c.images }));
                            });
                        });
                    }
                } catch (e) {
                    console.error("Failed to load saved hamper", e);
                }
            }
        }
    }, [dispatch, user]);

    // Persistence: Save to Local Storage on change
    useEffect(() => {
        const stateToSave = {
            selectedBox,
            hamperItems: selectedHamperItems,
            productItems: selectedProducts,
            itemCustomizations,
            note,
            imageLinks
        };
        localStorage.setItem('hamper_state', JSON.stringify(stateToSave));
    }, [selectedBox, selectedHamperItems, selectedProducts, itemCustomizations, note, imageLinks]);

    const hamperItemsPrice = Object.entries(selectedHamperItems).reduce((total, [itemId, qty]) => {
        const item = hamperItemsList.find(i => i.id === itemId);
        return total + (item ? item.price * qty : 0);
    }, 0);

    const productsPrice = Object.entries(selectedProducts).reduce((total, [pid, qty]) => {
        const prod = shopProducts.find(p => p.id === pid);
        return total + (prod ? prod.price * qty : 0);
    }, 0);

    const totalPrice = (selectedBox?.basePrice || 0) + hamperItemsPrice + productsPrice;

    // Helper for Step 1 -> Step 2 transition is just setStep(2)
    // Helper for Step 2 -> Step 3 transition logic is inline in render

    const handleAddImage = () => {
        if (currLink.trim()) {
            dispatch(addImageLink(currLink));
            setCurrLink('');
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            toast.error("Please login to create a hamper");
            return;
        }
        if (!selectedBox) return;

        try {
            // Update note in redux
            dispatch(updateNote(currNote));

            // items payload - unified and expanded
            const allItems: any[] = [];

            // Process Hamper Items
            Object.entries(selectedHamperItems).forEach(([id, qty]) => {
                for (let i = 0; i < qty; i++) {
                    const cust = itemCustomizations[id]?.[i];
                    allItems.push({
                        productId: id,
                        quantity: 1,
                        customizationNote: cust?.note,
                        customizationImages: cust?.images
                    });
                }
            });

            // Process Products
            Object.entries(selectedProducts).forEach(([id, qty]) => {
                for (let i = 0; i < qty; i++) {
                    const cust = itemCustomizations[id]?.[i];
                    allItems.push({
                        productId: id,
                        quantity: 1,
                        customizationNote: cust?.note,
                        customizationImages: cust?.images
                    });
                }
            });

            dispatch(createHamper({
                boxId: selectedBox.id,
                items: allItems,
                note: currNote,
                imageLinks: imageLinks,
                userId: user.id
            })).unwrap().then((customHamper) => {
                // Direct Checkout separate from Cart
                toast.success("Proceeding to checkout...");
                dispatch(clearHamper());
                router.push(`/checkout?direct=true&hamperId=${customHamper.id}`);
            }).catch((e) => {
                console.error("Failed to create hamper", e);
                toast.error("Failed to proceed to checkout");
            });

        } catch (error) {
            console.error("Error in add to cart flow", error);
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-black text-white pt-24 pb-12">
                <div className="container mx-auto px-4">Loading...</div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header & Progress */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-4">Build Your Custom Hamper</h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                        <span className={step >= 1 ? "text-primary font-bold" : ""}>1. Add Items</span>
                        <ChevronRight size={14} />
                        <span className={step >= 2 ? "text-primary font-bold" : ""}>2. Select Box</span>
                        <ChevronRight size={14} />
                        <span className={step >= 3 ? "text-primary font-bold" : ""}>3. Review & Customize</span>
                    </div>
                </div>

                {/* Step 1: Add Items */}
                {step === 1 && (
                    <div className="animate-fadeIn">
                        <div className="sticky top-20 z-10 bg-black/95 border-b border-gray-800 backdrop-blur-md mb-8 transition-all shadow-lg">
                            <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">

                                {/* Visual List of Items */}
                                <div className="flex-1 w-full overflow-x-auto min-h-[50px] flex items-center gap-2 px-2 md:px-6 no-scrollbar mask-gradient-x">
                                    {totalItemsCount === 0 && (
                                        <div className="text-gray-600 text-sm italic w-full text-center md:text-left">Start adding items to build your hamper...</div>
                                    )}

                                    {/* Hamper Items */}
                                    {Object.entries(selectedHamperItems).map(([id, qty]) => {
                                        const item = hamperItemsList.find(i => i.id === id);
                                        if (!item || qty < 1) return null;
                                        return (
                                            <div key={id} className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 group cursor-help transition-transform hover:scale-105">
                                                <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover" />
                                                <span className="absolute bottom-0 right-0 bg-primary/90 backdrop-blur-[2px] text-white text-[9px] px-1.5 font-bold rounded-tl-md">{qty}</span>
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max bg-gray-900 border border-gray-700 text-white text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                                    {item.name}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Products */}
                                    {Object.entries(selectedProducts).map(([id, qty]) => {
                                        const item = shopProducts.find(i => i.id === id);
                                        if (!item || qty < 1) return null;
                                        return (
                                            <div key={id} className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-gray-700 bg-gray-900 group cursor-help transition-transform hover:scale-105">
                                                <Image src={item.images[0] || "/placeholder.png"} alt={item.name} fill className="object-cover" />
                                                <span className="absolute bottom-0 right-0 bg-secondary/90 backdrop-blur-[2px] text-white text-[9px] px-1.5 font-bold rounded-tl-md">{qty}</span>
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max bg-gray-900 border border-gray-700 text-white text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                                                    {item.name}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-gray-800 pt-3 md:pt-0">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">{totalItemsCount} Items Selected</div>
                                        <div className="font-bold text-primary text-lg">Item Total: ₹{totalPrice - (selectedBox?.basePrice || 0)}</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (totalItemsCount === 0) {
                                                toast.error("Please add at least one item.");
                                                return;
                                            }
                                            setStep(2);
                                        }}
                                        className="px-6 py-2.5 rounded-full font-bold transition-all shadow-lg bg-primary text-white hover:bg-primary-light shadow-primary/20 hover:scale-105 active:scale-95"
                                    >
                                        Choose Box <ChevronRight className="inline ml-1" size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Display Added Shop Products Section if any */}
                        {Object.keys(selectedProducts).length > 0 && (
                            <div className="mb-12">
                                <h3 className="text-2xl font-serif font-bold mb-6">Added Shop Products</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(selectedProducts).map(([pid, qty]) => {
                                        const prod = shopProducts.find(p => p.id === pid);
                                        if (!prod) return <Skeleton key={pid} className="h-32 rounded-xl" />;
                                        return (
                                            <div key={pid} className="bg-[#121212] border border-gray-800 rounded-xl p-4 flex gap-4">
                                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-900 shrink-0">
                                                    <Image src={prod.images[0] || "/placeholder.png"} alt={prod.name} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white truncate">{prod.name}</h4>
                                                    <p className="text-gray-400 text-sm mb-2">₹{prod.price}</p>
                                                    <div className="flex items-center bg-gray-800 rounded-full w-fit">
                                                        <button onClick={() => handleProductChange(pid, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 text-white"><Minus size={14} /></button>
                                                        <span className="w-8 text-center text-sm font-bold">{qty}</span>
                                                        <button onClick={() => handleProductChange(pid, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 text-white"><Plus size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <h3 className="text-2xl font-serif font-bold mb-6">Add Hamper Essentials</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {hamperItemsList.map((item) => (
                                <div key={item.id} className={`bg-[#121212] border ${selectedHamperItems[item.id] ? 'border-primary' : 'border-gray-800'} rounded-xl overflow-hidden transition-all`}>
                                    <div className="aspect-square relative bg-gray-900">
                                        <Image src={item.image || "/placeholder.png"} alt={item.name} fill className="object-cover" />
                                        {selectedHamperItems[item.id] ? (
                                            <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                                {selectedHamperItems[item.id]}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-medium text-white truncate mb-1">{item.name}</h4>
                                        <p className="text-gray-400 text-sm mb-3">₹{item.price}</p>

                                        {selectedHamperItems[item.id] ? (
                                            <div className="flex items-center justify-between bg-gray-800 rounded-full p-1">
                                                <button onClick={() => handleItemChange(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-black hover:bg-gray-700 text-white"><Minus size={12} /></button>
                                                <span className="text-sm font-bold">{selectedHamperItems[item.id]}</span>
                                                <button onClick={() => handleItemChange(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white"><Plus size={12} /></button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleItemChange(item.id, 1)}
                                                className="w-full py-1.5 rounded-full border border-gray-700 hover:border-primary hover:text-primary transition-colors text-sm"
                                            >
                                                Add
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Box */}
                {step === 2 && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-8 sticky top-20 bg-black/95 p-4 z-10 border-b border-gray-800 backdrop-blur-md">
                            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
                                <ChevronLeft size={20} /> Back to Items
                            </button>
                            <div className="text-center">
                                <div className="text-sm text-gray-400">Total Items: {totalItemsCount}</div>
                                <div className="text-xl font-bold text-primary">Select Box</div>
                            </div>
                            <div className="w-24"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                            {boxes.map((box) => (
                                <div
                                    key={box.id}
                                    onClick={() => {
                                        if (totalItemsCount < box.minItems) {
                                            toast.error(`This box requires at least ${box.minItems} items. You have ${totalItemsCount}.`);
                                            return;
                                        }
                                        handleBoxSelect(box);
                                        setStep(3); // Go to review
                                    }}
                                    className={`group relative bg-[#121212] border ${selectedBox?.id === box.id ? 'border-primary' : 'border-gray-800'} ${totalItemsCount < box.minItems ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'} rounded-2xl overflow-hidden transition-all duration-300`}
                                >
                                    <div className="aspect-square relative bg-gray-900">
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                            {box.image ? (
                                                <Image src={box.image} alt={box.name} fill className="object-cover" />
                                            ) : (
                                                <span>No Image</span>
                                            )}
                                        </div>
                                        {totalItemsCount < box.minItems && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 text-center">
                                                <span className="text-red-400 font-bold border border-red-400 px-4 py-2 rounded-lg bg-black/80">Need {box.minItems} Items (Have {totalItemsCount})</span>
                                            </div>
                                        )}
                                        {totalItemsCount >= box.minItems && (
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="bg-primary text-white px-6 py-2 rounded-full font-bold">Select & Proceed</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-serif font-bold mb-2">{box.name}</h3>
                                        <div className="flex justify-between items-center text-sm text-gray-400">
                                            <span>Base Price: ₹{box.basePrice}</span>
                                            <span>Min Items: {box.minItems}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && selectedBox && (
                    <div className="max-w-3xl mx-auto animate-fadeIn">
                        <button onClick={() => setStep(2)} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white">
                            <ChevronLeft size={20} /> Back to Box Selection
                        </button>

                        <div className="bg-[#121212] border border-gray-800 rounded-2xl p-8 mb-8">
                            <h2 className="text-2xl font-serif font-bold mb-6 text-center">Customize & Review</h2>

                            <div className="space-y-4 mb-8">
                                {/* Box */}
                                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                                    <div className="flex items-center gap-4">
                                        {selectedBox.image && <div className="relative w-12 h-12 rounded-lg overflow-hidden"><Image src={selectedBox.image} fill className="object-cover" alt={selectedBox.name} /></div>}
                                        <div>
                                            <div className="font-bold">{selectedBox.name} (Box)</div>
                                            <div className="text-sm text-gray-400">Base Price</div>
                                        </div>
                                    </div>
                                    <div className="font-bold">₹{selectedBox.basePrice}</div>
                                </div>

                                {/* Items List for Customization */}
                                <div className="space-y-6 mt-6">
                                    <h3 className="text-lg font-medium text-primary">Your Items</h3>

                                    {/* Merge Hamper Items and Products for display */}
                                    {[...Object.entries(selectedHamperItems), ...Object.entries(selectedProducts)].map(([id, qty]) => {
                                        const hamperItem = hamperItemsList.find(i => i.id === id);
                                        const productItem = shopProducts.find(i => i.id === id);
                                        const item = hamperItem || productItem;
                                        if (!item) return null;

                                        // Create an array for quantity to map distinct units
                                        return Array.from({ length: qty }).map((_, idx) => {
                                            const currentCustomization = itemCustomizations[id]?.[idx] || { note: '', images: [] };

                                            return (
                                                <div key={`${id}-${idx}`} className="border border-gray-800 rounded-xl p-4 mb-4 bg-gray-900/30">
                                                    <div className="flex gap-4 mb-4">
                                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-900 border border-gray-700">
                                                            <Image
                                                                src={('image' in item ? item.image : item.images?.[0]) || "/placeholder.png"}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="font-medium text-white">{item.name} <span className="text-xs text-gray-500 ml-2">Unit {idx + 1}</span></div>
                                                                    <div className="text-gray-400 text-sm">₹{item.price}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Item Customization Inputs */}
                                                    {/* Item Customization Inputs - Conditionally Rendered */}
                                                    <div className="grid gap-3">
                                                        {(item.productType === 'HAMPER') && (
                                                            <div>
                                                                <label className="text-xs text-gray-400 block mb-1">Note (Optional)</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                                                    placeholder={`Note for ${item.name}...`}
                                                                    value={currentCustomization.note}
                                                                    onChange={(e) => dispatch(setItemCustomization({
                                                                        id,
                                                                        index: idx,
                                                                        note: e.target.value
                                                                    }))}
                                                                />
                                                            </div>
                                                        )}
                                                        {(item.requiresImage || item.productType === 'HAMPER') && (
                                                            <div>
                                                                <label className="text-xs text-gray-400 block mb-1">Image Link (Optional)</label>
                                                                <div className="flex gap-2">
                                                                    <input
                                                                        type="text"
                                                                        className="flex-1 bg-black border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                                                                        placeholder="Paste image link..."
                                                                        onKeyDown={(e) => {
                                                                            if (e.key === 'Enter') {
                                                                                const val = (e.target as HTMLInputElement).value;
                                                                                if (val.trim()) {
                                                                                    const newImages = [...(currentCustomization.images || []), val.trim()];
                                                                                    dispatch(setItemCustomization({ id, index: idx, images: newImages }));
                                                                                    (e.target as HTMLInputElement).value = '';
                                                                                }
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={(e) => {
                                                                            const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                                                            const val = input.value;
                                                                            if (val.trim()) {
                                                                                const newImages = [...(currentCustomization.images || []), val.trim()];
                                                                                dispatch(setItemCustomization({ id, index: idx, images: newImages }));
                                                                                input.value = '';
                                                                            }
                                                                        }}
                                                                        className="bg-gray-800 px-3 py-1 rounded-lg text-xs hover:bg-gray-700"
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>    {/* Display added links */}
                                                    {currentCustomization.images && currentCustomization.images.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {currentCustomization.images.map((img, i) => (
                                                                <div key={i} className="bg-gray-800 rounded px-2 py-1 flex items-center gap-2 max-w-full">
                                                                    <span className="text-[10px] text-blue-400 truncate max-w-[150px] cursor-pointer" onClick={() => window.open(img, '_blank')}>{img}</span>
                                                                    <button
                                                                        onClick={() => {
                                                                            const newImages = currentCustomization.images.filter((_, imgIdx) => imgIdx !== i);
                                                                            dispatch(setItemCustomization({ id, index: idx, images: newImages }));
                                                                        }}
                                                                        className="text-gray-500 hover:text-red-400"
                                                                    >
                                                                        <Trash2 size={10} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })}
                                </div>

                                {/* Global Hamper Note */}
                                <div className="border-t border-gray-800 pt-6 mt-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Message for the Hamper (Card)</label>
                                    <textarea
                                        className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white focus:border-primary outline-none resize-none h-24"
                                        placeholder="Write a heartfelt message..."
                                        value={currNote}
                                        onChange={(e) => setCurrNote(e.target.value)}
                                    ></textarea>
                                </div>

                                {/* Google Drive / Photo Links */}
                                <div className="border-t border-gray-800 pt-6 mt-6">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Google Drive / Photo Links (Optional)</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-primary outline-none transition-colors"
                                            placeholder="Paste Google Drive or Photo link here..."
                                            value={currLink}
                                            onChange={(e) => setCurrLink(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                                        />
                                        <button
                                            onClick={handleAddImage}
                                            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {imageLinks.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {imageLinks.map((link, idx) => (
                                                <div key={idx} className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-full">
                                                    <span className="text-xs text-blue-400 truncate max-w-[200px] block underline cursor-pointer" onClick={() => window.open(link, '_blank')}>{link}</span>
                                                    <button onClick={() => dispatch(removeImageLink(idx))} className="text-gray-500 hover:text-red-400">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Total & Checkout Action */}
                                <div className="border-t border-gray-800 pt-6 mt-6">
                                    <div className="flex justify-between items-center text-xl font-bold mb-6">
                                        <span>Total Amount</span>
                                        <span className="text-primary">₹{totalPrice}</span>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 text-lg flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag size={20} />
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }

            </div >
        </main >
    );
};

export default CustomHamperPage;
