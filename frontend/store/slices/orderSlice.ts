import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";
const API_URL = `${BASE_URL.replace(/\/$/, "")}/order`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Fetch User Orders
export const fetchUserOrders = createAsyncThunk(
    "order/fetchUserOrders",
    async (_, { rejectWithValue }) => {
        try {
            // Note: reusing BASE_URL logic but targeting /orders/user
            // API_URL in this file is /api/order, but we need /api/orders/user
            const response = await axiosInstance.get("../orders/user");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
        }
    }
);

interface OrderState {
    currentOrder: any | null;
    orders: any[]; // List of user orders
    loading: boolean;
    paymentLoading: boolean;
    error: string | null;
    success: boolean;
}

const initialState: OrderState = {
    currentOrder: null,
    orders: [],
    loading: false,
    paymentLoading: false,
    error: null,
    success: false,
};

// Create Order (COD)
export const createOrder = createAsyncThunk(
    "order/createOrder",
    async (orderData: { userId?: string; addressId?: string; addressData?: any; paymentMode: string; customHamperId?: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/create", orderData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to create order");
        }
    }
);

// Initiate Payment (Razorpay)
export const initiatePayment = createAsyncThunk(
    "order/initiatePayment",
    async ({ userId, customHamperId }: { userId?: string; customHamperId?: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/payment/initiate", { userId, customHamperId });
            return response.data; // { id, currency, amount, cartId, customHamperId }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to initiate payment");
        }
    }
);

// Verify Payment (Razorpay)
export const verifyPayment = createAsyncThunk(
    "order/verifyPayment",
    async (paymentData: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
        addressId?: string;
        addressData?: any;
        userId?: string;
        customHamperId?: string;
    }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/payment/verify", paymentData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Payment verification failed");
        }
    }
);

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        resetOrderState: (state) => {
            state.loading = false;
            state.paymentLoading = false;
            state.error = null;
            state.success = false;
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentOrder = action.payload.data;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Initiate Payment
            .addCase(initiatePayment.pending, (state) => {
                state.paymentLoading = true;
                state.error = null;
            })
            .addCase(initiatePayment.fulfilled, (state) => {
                state.paymentLoading = false;
                // We don't store order data here yet, just ready to open modal
            })
            .addCase(initiatePayment.rejected, (state, action) => {
                state.paymentLoading = false;
                state.error = action.payload as string;
            })
            // Verify Payment
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentOrder = action.payload.data;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch User Orders
            .addCase(fetchUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
