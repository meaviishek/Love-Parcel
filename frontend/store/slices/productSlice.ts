import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5051/api/";

interface Product {
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
    requiresImage?: boolean;
    productType?: 'SINGLE' | 'HAMPER';
    category?: {
        name: string;
        slug: string;
    };
    createdAt?: string;
}

interface ProductState {
    products: Product[];
    selectedProduct: Product | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProductState = {
    products: [],
    selectedProduct: null,
    loading: false,
    error: null,
};

export const fetchProducts = createAsyncThunk(
    "product/fetchProducts",
    async (params: { search?: string; category?: string; occasion?: string; tags?: string; minPrice?: number; maxPrice?: number } | undefined, { rejectWithValue }) => {
        try {
            let url = `${API_BASE_URL}products/get-all`;
            const queryParams = new URLSearchParams();

            if (params?.search) queryParams.append('search', params.search);
            if (params?.category) queryParams.append('category', params.category);
            if (params?.occasion) queryParams.append('occasion', params.occasion);
            if (params?.tags) queryParams.append('tags', params.tags);
            if (params?.minPrice !== undefined) queryParams.append('minPrice', params.minPrice.toString());
            if (params?.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice.toString());

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const response = await axios.get(url);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch products");
        }
    }
);

export const fetchProductById = createAsyncThunk(
    "product/fetchProductById",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}products/get/${id}`);
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
        }
    }
);

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedProduct = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export default productSlice.reducer;
