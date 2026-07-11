"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Banknote, MapPin, Truck, ShieldCheck, CheckCircle2, Plus, Pencil, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PaymentResultModal from '@/components/PaymentResultModal';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCart } from '@/store/slices/cartSlice';
import { createOrder, initiatePayment, verifyPayment, resetOrderState } from '@/store/slices/orderSlice';
import { fetchAddresses, addAddress, updateAddress, deleteAddress, Address } from '@/store/slices/addressSlice';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const CheckoutPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();

    const { items: cartItems, totalAmount } = useSelector((state: RootState) => state.cart);
    const { user } = useSelector((state: RootState) => state.auth);
    const { loading, paymentLoading, success, currentOrder, error } = useSelector((state: RootState) => state.order);
    const { addresses, loading: addressLoading } = useSelector((state: RootState) => state.address);

    const directBuy = searchParams.get('direct') === 'true';
    const directHamperId = searchParams.get('hamperId');
    const [directHamper, setDirectHamper] = useState<any | null>(null);

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Address Modal State
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState({
        fullName: '',
        phone: '',
        house: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
    });

    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');

    // Result Modal State
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        status: 'success' | 'failed';
        title: string;
        message: string;
        orderId?: string;
    }>({
        isOpen: false, // Initial state must be false
        status: 'success',
        title: '',
        message: ''
    });

    // Initial Data Fetch
    useEffect(() => {
        if (directBuy && directHamperId) {
            const fetchHamper = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5051/api"}/hamper/${directHamperId}`, { withCredentials: true });
                    if (response.data?.status === 'success') {
                        setDirectHamper(response.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch custom hamper", err);
                    router.push('/cart');
                }
            };
            fetchHamper();
        } else {
            dispatch(fetchCart());
        }
        dispatch(fetchAddresses());
    }, [dispatch, directBuy, directHamperId, router]);

    // Set Default Address
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            setSelectedAddressId(addresses[0].id);
        }
    }, [addresses, selectedAddressId]);

    // Handle Order Success
    useEffect(() => {
        if (success && currentOrder) {
            setModalState({
                isOpen: true,
                status: 'success',
                title: 'Order Placed Successfully!',
                message: `Thank you for your purchase. Your order has been placed successfully.`,
                orderId: currentOrder.id
            });
            dispatch(resetOrderState());
            if (!directBuy) {
                dispatch(fetchCart());
            }
        }
    }, [success, currentOrder, dispatch, directBuy]);


    // Computed Values
    let displayedItems: any[] = [];
    let subtotal = 0;

    if (directBuy && directHamper) {
        displayedItems = [{
            id: directHamper.id,
            quantity: 1,
            price: directHamper.totalPrice,
            customHamper: directHamper
        }];
        subtotal = directHamper.totalPrice;
    } else {
        displayedItems = cartItems || [];
        subtotal = cartItems.reduce((acc, item) => {
            const price = (item.customHamper ? item.customHamper.totalPrice : (item.price || item.details?.price || 0));
            return acc + (price * item.quantity);
        }, 0);
    }

    const shipping = 0;
    const total = subtotal + shipping;

    // Address Handlers
    const handleAddNewClick = () => {
        setEditingAddress(null);
        setAddressForm({
            fullName: '',
            phone: '',
            house: '',
            area: '',
            landmark: '',
            city: '',
            state: '',
            pincode: ''
        });
        setIsAddressModalOpen(true);
    };

    const handleEditClick = (address: Address) => {
        setEditingAddress(address);
        setAddressForm({
            fullName: address.fullName,
            phone: address.phone,
            house: address.house,
            area: address.area,
            landmark: address.landmark || '',
            city: address.city,
            state: address.state,
            pincode: address.pincode
        });
        setIsAddressModalOpen(true);
    };

    const handleDeleteClick = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this address?')) {
            await dispatch(deleteAddress(id));
            if (selectedAddressId === id) {
                setSelectedAddressId(null);
            }
        }
    };

    const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAddress) {
                await dispatch(updateAddress({ id: editingAddress.id, data: addressForm })).unwrap();
            } else {
                const result = await dispatch(addAddress(addressForm)).unwrap();
                setSelectedAddressId(result.data.id);
            }
            setIsAddressModalOpen(false);
        } catch (err: any) {
            alert(err || "Failed to save address");
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            setModalState({
                isOpen: true,
                status: 'failed',
                title: 'Address Required',
                message: 'Please select a delivery address.'
            });
            return;
        }

        if (paymentMethod === 'cod') {
            try {
                await dispatch(createOrder({
                    userId: user?.id,
                    addressId: selectedAddressId,
                    paymentMode: "COD",
                    customHamperId: (directBuy && directHamperId) || undefined
                })).unwrap();
            } catch (err) {
                console.error("COD Order Failed", err);
                setModalState({
                    isOpen: true,
                    status: 'failed',
                    title: 'Order Failed',
                    message: 'Failed to place COD order. Please try again.'
                });
            }
        } else {
            // Razorpay
            try {
                const responsePayload = await dispatch(initiatePayment({
                    userId: user?.id,
                    customHamperId: (directBuy && directHamperId) || undefined
                })).unwrap();
                const paymentData = responsePayload?.data;

                if (!paymentData || !paymentData.id) {
                    throw new Error("Invalid payment data");
                }

                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    name: "LuxeLoom",
                    description: "Order Payment",
                    order_id: paymentData.id,
                    handler: async function (response: any) {
                        try {
                            await dispatch(verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                addressId: selectedAddressId,
                                userId: user?.id,
                                customHamperId: (directBuy && directHamperId) || undefined
                            })).unwrap();
                        } catch (verifyErr) {
                            setModalState({
                                isOpen: true,
                                status: 'failed',
                                title: 'Verification Failed',
                                message: 'Payment verification failed. Please contact support.'
                            });
                        }
                    },
                    prefill: {
                        name: user?.name,
                        email: user?.email,
                        contact: user?.phone
                    },
                    theme: {
                        color: "#D4AF37"
                    }
                };

                const rzp1 = new (window as any).Razorpay(options);
                rzp1.open();

            } catch (err) {
                console.error("Razorpay Initiation Failed", err);
                setModalState({
                    isOpen: true,
                    status: 'failed',
                    title: 'Payment Error',
                    message: 'Failed to initiate online payment.'
                });
            }
        }
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="container mx-auto px-4 max-w-6xl py-8">

                <Link href={directBuy ? "/custom-hamper" : "/cart"} className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to {directBuy ? "Hamper" : "Cart"}
                </Link>

                <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8">Checkout {directBuy && "(Direct Buy)"}</h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Shipping & Payment */}
                    <div className="flex-1 space-y-8">

                        {/* Shipping Details Section */}
                        <div className="bg-[#121212] p-6 md:p-8 rounded-[32px] border border-gray-900">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <MapPin size={20} />
                                    </div>
                                    <h2 className="text-xl md:text-2xl font-serif font-bold">Shipping Details</h2>
                                </div>
                                <button
                                    onClick={handleAddNewClick}
                                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                >
                                    <Plus size={16} /> Add New
                                </button>
                            </div>

                            {/* Address List */}
                            <div className="space-y-4">
                                {addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        onClick={() => setSelectedAddressId(address.id)}
                                        className={`bg-black border rounded-2xl p-4 cursor-pointer transition-all flex items-start gap-4 ${selectedAddressId === address.id
                                            ? 'border-primary ring-1 ring-primary/50'
                                            : 'border-gray-800 hover:border-gray-700'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center ${selectedAddressId === address.id ? 'border-primary' : 'border-gray-600'
                                            }`}>
                                            {selectedAddressId === address.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold">{address.fullName}</h3>
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); handleEditClick(address); }} className="text-gray-400 hover:text-white p-1">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={(e) => handleDeleteClick(address.id, e)} className="text-gray-400 hover:text-red-500 p-1">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 text-sm mt-1">{address.house}, {address.area}</p>
                                            <p className="text-gray-400 text-sm">{address.city}, {address.state} - {address.pincode}</p>
                                            <p className="text-gray-400 text-sm mt-1">Phone: {address.phone}</p>
                                        </div>
                                    </div>
                                ))}

                                {addresses.length === 0 && !addressLoading && (
                                    <div className="text-center py-8 text-gray-500">
                                        No addresses found. Please add a new address.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Method Section */}
                        <div className="bg-[#121212] p-6 md:p-8 rounded-[32px] border border-gray-900">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                    <CreditCard size={20} />
                                </div>
                                <h2 className="text-xl md:text-2xl font-serif font-bold">Payment Method</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label
                                    className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-800 bg-black hover:border-gray-700'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="hidden"
                                    />
                                    {paymentMethod === 'cod' && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    )}
                                    <Banknote size={32} className="mb-3 text-gray-300" />
                                    <span className="font-bold text-lg">Cash on Delivery</span>
                                </label>

                                <label
                                    className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay'
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-800 bg-black hover:border-gray-700'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="razorpay"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={() => setPaymentMethod('razorpay')}
                                        className="hidden"
                                    />
                                    {paymentMethod === 'razorpay' && (
                                        <div className="absolute top-3 right-3 text-primary">
                                            <CheckCircle2 size={20} />
                                        </div>
                                    )}
                                    <CreditCard size={32} className="mb-3 text-gray-300" />
                                    <span className="font-bold text-lg">Razorpay</span>
                                </label>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:w-96 flex-shrink-0">
                        <div className="bg-[#121212] rounded-[32px] p-6 sticky top-24 border border-gray-900">
                            <h2 className="text-xl font-serif font-bold mb-6">Your Order</h2>

                            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {displayedItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-gray-800 rounded-md flex items-center justify-center text-xs text-gray-400 font-bold">
                                                {item.quantity}x
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-300 line-clamp-1">
                                                    {item.customHamper ? `Custom Hamper - ${item.customHamper.box?.name || 'Box'}` : (item.details?.name || "Unknown Item")}
                                                </span>
                                                {item.customHamper && <span className="text-xs text-gray-500">Customized</span>}
                                            </div>
                                        </div>
                                        <span className="text-white font-medium">Rs. {(item.customHamper ? item.customHamper.totalPrice : (item.price || item.details?.price || 0)) * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-gray-800 my-6"></div>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-white">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-sm">
                                    <span>Shipping</span>
                                    <span className="text-green-500">Free</span>
                                </div>
                                <div className="border-t border-gray-800 pt-4 flex justify-between items-center text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-primary">Rs. {total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading || paymentLoading || !selectedAddressId}
                                className="w-full bg-white text-black py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {(loading || paymentLoading) ? 'Processing...' : `Pay Rs. ${total.toLocaleString()}`}
                            </button>
                            {/* Warning if no address selected */}
                            {!selectedAddressId && !loading && !paymentLoading && (
                                <p className="text-amber-500 text-xs text-center mt-2">Please select an address to proceed</p>
                            )}
                            {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
                        </div>
                    </div>

                </div>
            </div>

            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1e1e1e] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                                <input name="fullName" value={addressForm.fullName} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Phone</label>
                                <input name="phone" value={addressForm.phone} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Pincode</label>
                                <input name="pincode" value={addressForm.pincode} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">House No. / Flat</label>
                                <input name="house" value={addressForm.house} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Area / Street</label>
                                <input name="area" value={addressForm.area} onChange={handleAddressFormChange} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">City</label>
                                <input name="city" value={addressForm.city} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">State</label>
                                <input name="state" value={addressForm.state} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Landmark (Optional)</label>
                                <input name="landmark" value={addressForm.landmark} onChange={handleAddressFormChange} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 focus:border-primary focus:outline-none" />
                            </div>

                            <div className="md:col-span-2 mt-4 flex gap-4">
                                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-700 hover:bg-gray-800">Cancel</button>
                                <button type="submit" disabled={addressLoading} className="flex-1 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90">
                                    {addressLoading ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <PaymentResultModal
                isOpen={modalState.isOpen}
                status={modalState.status}
                title={modalState.title}
                message={modalState.message}
                orderId={modalState.orderId}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                onRetry={() => setModalState(prev => ({ ...prev, isOpen: false }))}
            />
        </main >
    );
};

export default CheckoutPage;
