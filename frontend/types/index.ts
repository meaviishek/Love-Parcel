export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  _count?: {
    products: number;
  }
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  tags?: string[];
  occasions?: string[];
  categoryId: string;
  isActive: boolean;
  specifications?: Record<string, any>;
  category?: Category;
  createdAt?: string;
}

export interface ShopFilters {
  category: string | null;
  priceRange: [number, number];
  sort: string;
  search: string;
  occasions?: string; // Comma separated
  tags?: string;     // Comma separated
}


export interface Address {
  id: string;
  fullName: string;
  phone: string;
  house: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  totalAmount: number;
  paymentMode: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  items?: any[];
}

export interface User {
  id: string; // Ensure ID is present
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  role?: 'Member' | 'Pro' | 'Organizer';
  addresses?: Address[];
  orders?: Order[];
  location?: string;
}