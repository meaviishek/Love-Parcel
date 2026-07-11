"use client";
import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, LogOut, Plus, Pencil, Trash2, X, Archive, Truck, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Skeleton from '@/components/ui/Skeleton';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { fetchAddresses, addAddress, updateAddress, deleteAddress, Address } from '@/store/slices/addressSlice';
import { fetchUserOrders } from '@/store/slices/orderSlice';
import { logoutUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function MyAccountPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);
    const { addresses, loading: addressLoading } = useSelector((state: RootState) => state.address);
    const { orders, loading: ordersLoading } = useSelector((state: RootState) => state.order);

    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

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

    useEffect(() => {
        if (activeTab === 'addresses') {
            dispatch(fetchAddresses());
        }
        if (activeTab === 'orders') {
            dispatch(fetchUserOrders());
        }
    }, [activeTab, dispatch]);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        router.push('/');
    };

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

    const handleDeleteClick = async (id: string) => {
        if (confirm('Are you sure you want to delete this address?')) {
            await dispatch(deleteAddress(id));
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
                await dispatch(addAddress(addressForm)).unwrap();
            }
            setIsAddressModalOpen(false);
        } catch (err: any) {
            alert(err || "Failed to save address");
        }
    };

    if (!user) {
        // Optionally redirect or show loading
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <p>Please log in to view your account.</p>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-black">


            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8">My Account</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-64 shrink-0">
                        <div className="bg-[#121212] border border-gray-800 rounded-2xl overflow-hidden sticky top-24">
                            <div className="p-6 border-b border-gray-800 text-center">
                                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-2xl font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <h3 className="font-bold text-white mb-1">{user.name}</h3>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                            <nav className="p-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <User size={18} /> Profile
                                </button>
                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <Package size={18} /> Orders
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'addresses' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <MapPin size={18} /> Addresses
                                </button>
                                <div className="h-px bg-gray-800 my-2"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="bg-[#121212] border border-gray-800 rounded-2xl p-6 md:p-8">
                                    <h2 className="text-xl font-serif font-bold text-white mb-6">Personal Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-gray-500 text-sm mb-1">Full Name</label>
                                            <div className="text-white font-medium bg-black/50 px-4 py-3 rounded-lg border border-gray-800">{user.name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm mb-1">Email Address</label>
                                            <div className="text-white font-medium bg-black/50 px-4 py-3 rounded-lg border border-gray-800">{user.email}</div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm mb-1">Phone Number</label>
                                            <div className="text-white font-medium bg-black/50 px-4 py-3 rounded-lg border border-gray-800">{user.phone || '-'}</div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-500 text-sm mb-1">Account Type</label>
                                            <div className="text-white font-medium bg-black/50 px-4 py-3 rounded-lg border border-gray-800 uppercase text-xs tracking-wider">{user.role || 'CUSTOMER'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-serif font-bold text-white mb-4">Order History</h2>
                                {ordersLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
                                                <div className="flex justify-between mb-4 border-b border-gray-800 pb-4">
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-48" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-3 w-20 ml-auto" />
                                                        <Skeleton className="h-5 w-24 ml-auto" />
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <Skeleton className="h-4 w-40" />
                                                        <Skeleton className="h-4 w-16" />
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-4 w-16" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-800">
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-[#121212] border border-gray-800 rounded-2xl p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Archive className="text-gray-500" size={32} />
                                        </div>
                                        <h3 className="text-white font-bold mb-2">No orders yet</h3>
                                        <p className="text-gray-400 text-sm">You haven't placed any orders yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order: any) => (
                                            <div key={order.id} className="bg-[#121212] border border-gray-800 rounded-2xl p-6 overflow-hidden hover:border-gray-700 transition-colors">
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-gray-800 pb-4">
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <span className="text-white font-bold">#{order.id.slice(-10).toUpperCase()}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${order.orderStatus === 'PLACED' ? 'bg-blue-500/20 text-blue-500' :
                                                                order.orderStatus === 'DELIVERED' ? 'bg-green-500/20 text-green-500' :
                                                                    order.orderStatus === 'CANCELLED' ? 'bg-red-500/20 text-red-500' :
                                                                        'bg-gray-500/20 text-gray-400'
                                                                }`}>
                                                                {order.orderStatus}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-400 mb-1">Total Amount</p>
                                                        <p className="text-lg font-bold text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    {order.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="bg-black/30 rounded-lg p-3 border border-gray-800">
                                                            {item.customHamper ? (
                                                                // Custom Hamper Display
                                                                <div>
                                                                    <div className="flex justify-between items-start mb-2 border-b border-gray-800 pb-2">
                                                                        <div>
                                                                            <span className="font-bold text-primary block">Custom Hamper</span>
                                                                            <span className="text-xs text-gray-400">Box: {item.customHamper.box?.name || 'Unknown Box'}</span>
                                                                            {item.customHamper.note && (
                                                                                <p className="text-xs text-gray-500 italic mt-0.5">Note: {item.customHamper.note}</p>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-white font-bold">Rs. {item.price * item.quantity}</span>
                                                                    </div>

                                                                    <div className="space-y-3 pl-2 border-l-2 border-gray-800 ml-1">
                                                                        {item.customHamper.items?.map((hItem: any, hIdx: number) => (
                                                                            <div key={hIdx} className="text-sm">
                                                                                <div className="flex justify-between">
                                                                                    <span className="text-gray-300">{hItem.product?.name || 'Unknown Item'} <span className="text-xs text-gray-600">x{hItem.quantity}</span></span>
                                                                                </div>

                                                                                {/* Item Customizations */}
                                                                                {(hItem.customizationNote || (hItem.customizationImages && hItem.customizationImages.length > 0)) && (
                                                                                    <div className="mt-1 text-xs space-y-1">
                                                                                        {hItem.customizationNote && (
                                                                                            <p className="text-gray-500">Note: {hItem.customizationNote}</p>
                                                                                        )}
                                                                                        {hItem.customizationImages && hItem.customizationImages.length > 0 && (
                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                {hItem.customizationImages.map((link: string, lIdx: number) => (
                                                                                                    <a
                                                                                                        key={lIdx}
                                                                                                        href={link}
                                                                                                        target="_blank"
                                                                                                        rel="noopener noreferrer"
                                                                                                        className="text-blue-400 underline hover:text-blue-300"
                                                                                                    >
                                                                                                        View Image {lIdx + 1}
                                                                                                    </a>
                                                                                                ))}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                // Regular Product Display
                                                                <div className="flex justify-between items-center">
                                                                    <div className="flex items-center gap-3">
                                                                        {item.details?.image && (
                                                                            <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-900 border border-gray-800">
                                                                                {/* Using standard img tag or Next Image if feasible, but img is safer without imports/props */}
                                                                                <img src={item.details.image} alt={item.details.name} className="object-cover w-full h-full" />
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <span className="text-gray-300 block">{item.details?.name || 'Unknown Product'}</span>
                                                                            <span className="text-xs text-gray-500">{item.quantity} x Rs. {item.price}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-white font-medium">Rs. {item.price * item.quantity}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                                                    <div className="flex items-center gap-2">
                                                        <Truck size={14} /> {order.paymentMode} ({order.paymentStatus})
                                                    </div>
                                                    {/* Future: Add View Details Button */}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-xl font-serif font-bold text-white">Saved Addresses</h2>
                                    <button
                                        onClick={handleAddNewClick}
                                        className="flex items-center gap-2 text-sm bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-white transition-colors"
                                    >
                                        <Plus size={16} /> Add New
                                    </button>
                                </div>

                                {addressLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[1, 2].map(i => (
                                            <div key={i} className="bg-[#121212] border border-gray-800 rounded-2xl p-6">
                                                <Skeleton className="h-5 w-32 mb-2" />
                                                <Skeleton className="h-4 w-24 mb-4" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-3 w-full" />
                                                    <Skeleton className="h-3 w-2/3" />
                                                    <Skeleton className="h-3 w-1/2" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="bg-[#121212] border border-gray-800 rounded-2xl p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MapPin className="text-gray-500" size={32} />
                                        </div>
                                        <h3 className="text-white font-bold mb-2">No addresses saved</h3>
                                        <p className="text-gray-400 text-sm">Add an address to speed up checkout.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address) => (
                                            <div key={address.id} className="bg-[#121212] border border-gray-800 rounded-2xl p-6 relative group">
                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEditClick(address)} className="p-2 bg-gray-800 rounded-lg hover:bg-white hover:text-black transition-colors">
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button onClick={() => handleDeleteClick(address.id)} className="p-2 bg-gray-800 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <h3 className="font-bold text-white mb-1">{address.fullName}</h3>
                                                <p className="text-gray-400 text-sm mb-4">{address.phone}</p>
                                                <div className="text-sm text-gray-500 space-y-1">
                                                    <p>{address.house}</p>
                                                    {address.area && <p>{address.area}</p>}
                                                    <p>{address.city}, {address.state}</p>
                                                    <p>{address.pincode}</p>
                                                    {address.landmark && <p className="text-xs mt-1 italic">Landmark: {address.landmark}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Address Modal (Same as Checkout) */}
            {isAddressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1e1e1e] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold text-white">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </h2>
                            <button onClick={() => setIsAddressModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                                <input name="fullName" value={addressForm.fullName} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Phone</label>
                                <input name="phone" value={addressForm.phone} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Pincode</label>
                                <input name="pincode" value={addressForm.pincode} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">House No. / Flat</label>
                                <input name="house" value={addressForm.house} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Area / Street</label>
                                <input name="area" value={addressForm.area} onChange={handleAddressFormChange} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">City</label>
                                <input name="city" value={addressForm.city} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">State</label>
                                <input name="state" value={addressForm.state} onChange={handleAddressFormChange} required className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-gray-400 text-sm mb-2">Landmark (Optional)</label>
                                <input name="landmark" value={addressForm.landmark} onChange={handleAddressFormChange} className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-primary focus:outline-none" />
                            </div>

                            <div className="md:col-span-2 mt-4 flex gap-4">
                                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3 rounded-xl border border-gray-700 text-white hover:bg-gray-800">Cancel</button>
                                <button type="submit" disabled={addressLoading} className="flex-1 py-3 rounded-xl bg-primary text-black font-bold hover:bg-primary/90">
                                    {addressLoading ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
