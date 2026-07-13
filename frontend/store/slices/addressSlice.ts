import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";
const API_URL = `${BASE_URL.replace(/\/$/, "")}/address`;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export interface Address {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    house: string;
    area: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
}

interface AddressState {
    addresses: Address[];
    loading: boolean;
    error: string | null;
}

const initialState: AddressState = {
    addresses: [],
    loading: false,
    error: null,
};

// Thunks
export const fetchAddresses = createAsyncThunk(
    "address/fetchAddresses",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch addresses");
        }
    }
);

export const addAddress = createAsyncThunk(
    "address/addAddress",
    async (addressData: Omit<Address, "id" | "userId">, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/", addressData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to add address");
        }
    }
);

export const updateAddress = createAsyncThunk(
    "address/updateAddress",
    async ({ id, data }: { id: string; data: Partial<Address> }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to update address");
        }
    }
);

export const deleteAddress = createAsyncThunk(
    "address/deleteAddress",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/${id}`);
            return { id, ...response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to delete address");
        }
    }
);

const addressSlice = createSlice({
    name: "address",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload.data;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add
            .addCase(addAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses.push(action.payload.data);
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.addresses.findIndex(addr => addr.id === action.payload.data.id);
                if (index !== -1) {
                    state.addresses[index] = action.payload.data;
                }
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = state.addresses.filter(addr => addr.id !== action.payload.id);
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default addressSlice.reducer;
