import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

// Async Thunks
export const syncHamperItem = createAsyncThunk(
    "hamper/syncItem",
    async ({ productId, delta, userId }: { productId: string; delta: number; userId: string }, { rejectWithValue }) => {
        try {
            if (delta > 0) {
                const res = await axios.post(`${BASE_URL}hamper/add-item`, {
                    productId,
                    quantity: delta,
                    userId
                }, { withCredentials: true });
                return res.data;
            } else {
                const res = await axios.post(`${BASE_URL}hamper/remove-item`, {
                    productId,
                    userId
                }, { withCredentials: true });
                return res.data;
            }
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to sync item");
        }
    }
);

export const fetchHamperDraft = createAsyncThunk(
    "hamper/fetchDraft",
    async (userId: string, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}hamper/draft?userId=${userId}`, { withCredentials: true });
            return res.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch draft");
        }
    }
);

export const createHamper = createAsyncThunk(
    "hamper/create",
    async (payload: any, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${BASE_URL}hamper/create`, payload, { withCredentials: true });
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to create hamper");
        }
    }
);

export const fetchHamperBoxes = createAsyncThunk(
    "hamper/fetchBoxes",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}hamper/boxes`);
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch boxes");
        }
    }
);

export const fetchHamperItems = createAsyncThunk(
    "hamper/fetchItems",
    async (_, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${BASE_URL}hamper/items`);
            return res.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || "Failed to fetch hamper items");
        }
    }
);

interface ActiveHamperState {
    selectedBoxId: string | null;
    selectedBox: any | null; // Box details
    hamperItems: { [itemId: string]: number }; // itemId -> qty
    productItems: { [productId: string]: number }; // productId -> qty
    itemCustomizations: { [productId: string]: { note: string; images: string[] }[] }; // productId -> list of customizations per unit
    note: string;
    imageLinks: string[];
    drawerOpen: boolean;
    status?: 'idle' | 'loading' | 'failed';
    boxes: any[];
    availableItems: any[];
}

const initialState: ActiveHamperState = {
    selectedBoxId: null,
    selectedBox: null,
    hamperItems: {},
    productItems: {},
    itemCustomizations: {},
    note: '',
    imageLinks: [],
    drawerOpen: false,
    status: 'idle',
    boxes: [],
    availableItems: []
};

const hamperSlice = createSlice({
    name: "hamper",
    initialState,
    reducers: {
        setDrawerOpen: (state, action: PayloadAction<boolean>) => {
            state.drawerOpen = action.payload;
        },
        selectBox: (state, action: PayloadAction<any>) => {
            state.selectedBox = action.payload;
            state.selectedBoxId = action.payload.id;
        },
        addHamperItem: (state, action: PayloadAction<{ id: string; qty: number }>) => {
            const { id, qty } = action.payload;
            const current = state.hamperItems[id] || 0;
            const next = current + qty;

            // Sync customizations
            if (!state.itemCustomizations[id]) state.itemCustomizations[id] = [];
            if (qty > 0) {
                for (let i = 0; i < qty; i++) state.itemCustomizations[id].push({ note: '', images: [] });
            } else {
                // Remove from end
                const removeCount = Math.abs(qty);
                state.itemCustomizations[id] = state.itemCustomizations[id].slice(0, Math.max(0, state.itemCustomizations[id].length - removeCount));
            }

            if (next <= 0) {
                delete state.hamperItems[id];
                delete state.itemCustomizations[id];
            }
            else state.hamperItems[id] = next;
        },
        addProductItem: (state, action: PayloadAction<{ id: string; qty: number }>) => {
            const { id, qty } = action.payload;
            const current = state.productItems[id] || 0;
            const next = current + qty;

            // Sync customizations
            if (!state.itemCustomizations[id]) state.itemCustomizations[id] = [];
            if (qty > 0) {
                for (let i = 0; i < qty; i++) state.itemCustomizations[id].push({ note: '', images: [] });
            } else {
                const removeCount = Math.abs(qty);
                state.itemCustomizations[id] = state.itemCustomizations[id].slice(0, Math.max(0, state.itemCustomizations[id].length - removeCount));
            }

            if (next <= 0) {
                delete state.productItems[id];
                delete state.itemCustomizations[id];
            }
            else state.productItems[id] = next;
        },
        setItemCustomization: (state, action: PayloadAction<{ id: string; index: number; note?: string; images?: string[] }>) => {
            const { id, index, note, images } = action.payload;
            if (state.itemCustomizations[id] && state.itemCustomizations[id][index]) {
                if (note !== undefined) state.itemCustomizations[id][index].note = note;
                if (images !== undefined) state.itemCustomizations[id][index].images = images;
            }
        },
        updateNote: (state, action: PayloadAction<string>) => {
            state.note = action.payload;
        },
        addImageLink: (state, action: PayloadAction<string>) => {
            state.imageLinks.push(action.payload);
        },
        removeImageLink: (state, action: PayloadAction<number>) => {
            state.imageLinks = state.imageLinks.filter((_, i) => i !== action.payload);
        },
        clearHamper: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHamperBoxes.fulfilled, (state, action) => {
                state.boxes = action.payload;
            })
            .addCase(fetchHamperItems.fulfilled, (state, action) => {
                state.availableItems = action.payload;
            })
            .addCase(fetchHamperDraft.fulfilled, (state, action) => {
                if (action.payload.data) {
                    const draft = action.payload.data;
                    state.hamperItems = {};
                    state.productItems = {};
                    state.itemCustomizations = {};

                    if (draft.items && Array.isArray(draft.items)) {
                        draft.items.forEach((item: any) => {
                            const pid = item.productId;
                            const qty = item.quantity;

                            const current = state.productItems[pid] || 0;
                            state.productItems[pid] = current + qty;

                            if (!state.itemCustomizations[pid]) state.itemCustomizations[pid] = [];
                            state.itemCustomizations[pid].push({
                                note: item.customizationNote || '',
                                images: item.customizationImages || []
                            });
                        });
                    }
                    if (draft.boxId) {
                        state.selectedBoxId = draft.boxId;
                    }
                    if (draft.note) state.note = draft.note;
                    if (draft.imageLinks) state.imageLinks = draft.imageLinks;
                }
            });
    }
});

export const {
    setDrawerOpen,
    selectBox,
    addHamperItem,
    addProductItem,
    setItemCustomization,
    updateNote,
    addImageLink,
    removeImageLink,
    clearHamper
} = hamperSlice.actions;

export default hamperSlice.reducer;
