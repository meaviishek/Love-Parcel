import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Environment variable for API URL
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";
const API_URL = `${BASE_URL.replace(/\/$/, "")}/cart`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true // Important for cookies
});

export interface CartItem {
    id: string; // CartItem ID
    productId?: string;
    hamperId?: string;
    quantity: number;
    details?: any; // Product or Hamper details
    customHamper?: any; // Nested custom hamper details with box
    price?: number; // Calculated price from backend or derived
    customizationNote?: string;
    customizationImages?: string[];
    customization?: { // Legacy or Mapped
        note?: string;
        imageLinks?: string[];
    };
}

interface CartState {
    id: string | null;
    items: CartItem[];
    totalAmount: number; // Derived or from backend
    loading: boolean;
    error: string | null;
}

const initialState: CartState = {
    id: null,
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
};

// Async Thunks

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.get("/");
        return response.data; // Expected { status: "success", data: { id, items: [...] } }
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
});

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async ({ productId, hamperId, customHamperId, quantity, customization }: {
        productId?: string;
        hamperId?: string;
        customHamperId?: string;
        quantity: number;
        customization?: { note?: string; imageLinks?: string[] };
    }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/add", { productId, hamperId, customHamperId, quantity, customization });
            dispatch(fetchCart()); // Refresh cart after add
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add to cart");
        }
    }
);

export const updateCartItem = createAsyncThunk(
    "cart/updateCartItem",
    async ({ itemId, quantity }: { itemId: string; quantity: number }, { dispatch, rejectWithValue }) => {
        try {
            const response = await axiosInstance.put("/update", { itemId, quantity });
            dispatch(fetchCart());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update cart");
        }
    }
);

export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (itemId: string, { dispatch, rejectWithValue }) => {
        try {
            // Usually delete requests might need body or query params depending on implementation
            // Controller uses req.body.itemId
            const response = await axiosInstance.delete("/remove", { data: { itemId } });
            dispatch(fetchCart());
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove from cart");
        }
    }
);

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCartState: (state) => {
            state.items = [];
            state.totalAmount = 0;
            state.id = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                const cartData = action.payload.data;
                if (cartData) {
                    state.id = cartData.id;
                    state.items = cartData.items || [];

                    // Client-side calculation for total if not provided fully or just trust backend
                    // The backend `getCart` returns `items` with `details`.
                    // We can map this to a friendly structure or keep as is.
                }
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
        // Add/Update/Remove handled by re-fetching, 
        // but we can add loading states for them if deeper UI feedback needed.
    },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
