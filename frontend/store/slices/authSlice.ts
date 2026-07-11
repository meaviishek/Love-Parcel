import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5051/api/";


// Add credentials inclusion for all requests to ensure cookies are sent
axios.defaults.withCredentials = true;

interface AuthState {
    user: User | null;
    tickets: any[]; // Storing tickets in auth state as requested
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    tickets: [],
    isLoading: false,
    error: null
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface SignupCredentials extends LoginCredentials {
    name: string;
    phoneNumber: string;
}

interface SignupResponse {
    message: string;
    data: User;
    requiresVerification: boolean;
}

export const loginUser = createAsyncThunk<
    SignupResponse, // reusing SignupResponse structure as it is now identical
    LoginCredentials,
    { rejectValue: string }
>(
    "auth/loginUser",
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_BASE_URL + "v1/auth/signin", credentials);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Login failed");
        }
    }
);

export const signupUser = createAsyncThunk<
    SignupResponse,
    SignupCredentials,
    { rejectValue: string }
>(
    "auth/signupUser",
    async (credentials: SignupCredentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_BASE_URL + "v1/auth/signup", credentials);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Signup failed");
        }
    }
);

export const verifyEmail = createAsyncThunk<
    User,
    { otp: string, email: string },
    { rejectValue: string }
>(
    "auth/verifyEmail",
    async ({ otp, email }, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_BASE_URL + "v1/auth/verify-email", { otp, email });
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Verification failed");
        }
    }
);

export const resendOtp = createAsyncThunk<
    void,
    { email: string },
    { rejectValue: string }
>(
    "auth/resendOtp",
    async ({ email }, { rejectWithValue }) => {
        try {
            await axios.post(API_BASE_URL + "v1/auth/resend-otp", { email });
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to resend OTP");
        }
    }
);

export const forgotPassword = createAsyncThunk<
    void,
    { email: string },
    { rejectValue: string }
>(
    "auth/forgotPassword",
    async ({ email }, { rejectWithValue }) => {
        try {
            await axios.post(API_BASE_URL + "v1/auth/forgot-password", { email });
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to send reset email");
        }
    }
);

export const resetPassword = createAsyncThunk<
    void,
    { email: string, otp: string, newPassword: string },
    { rejectValue: string }
>(
    "auth/resetPassword",
    async (data, { rejectWithValue }) => {
        try {
            await axios.post(API_BASE_URL + "v1/auth/reset-password", data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to reset password");
        }
    }
);

export const googleLogin = createAsyncThunk<
    void,
    string | undefined,
    { rejectValue: string }
>(
    "auth/googleLogin",
    async (redirectPath, { rejectWithValue }) => {
        // For Passport Google OAuth, we redirect the browser to the backend route
        const query = redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : "";
        window.location.href = API_BASE_URL + "auth/google" + query;
        // Returns nothing as page will redirect
    }
)

export const checkAuth = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {

            const response = await axios.get(API_BASE_URL + "auth/me");
            return response.data.user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Session invalid");
        }
    }
)

export const logoutUser = createAsyncThunk<
    void,
    void,
    { rejectValue: string }
>(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            await axios.get(API_BASE_URL + "auth/logout");
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "logout failed");
        }
    }
)

export const fetchUserTickets = createAsyncThunk<
    any[],
    void,
    { rejectValue: string }
>(
    "auth/fetchUserTickets",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_BASE_URL + "user/tickets");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch tickets");
        }
    }
);

export const fetchMyAccount = createAsyncThunk<
    User,
    void,
    { rejectValue: string }
>(
    "auth/fetchMyAccount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_BASE_URL + "user/myaccount");
            return response.data.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch account details");
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(loginUser.fulfilled, (state, action: PayloadAction<SignupResponse>) => {
            state.isLoading = false;
            state.user = action.payload.data;
            state.error = null;
        })
        builder.addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || action.error.message || "Login failed";
        })

        // signupUser
        builder.addCase(signupUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(signupUser.fulfilled, (state, action: PayloadAction<SignupResponse>) => {
            state.isLoading = false;
            // storing user date even if unverified, to allow protected routes (like resend-otp) to work
            state.user = action.payload.data;
            state.error = null;
        })
        builder.addCase(signupUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || action.error.message || "Signup failed";
        })

        // verifyEmail
        builder.addCase(verifyEmail.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(verifyEmail.fulfilled, (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.user = action.payload; // Set verified user
            state.error = null;
        })
        builder.addCase(verifyEmail.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || action.error.message || "Verification failed";
        })

        // forgotPassword
        builder.addCase(forgotPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(forgotPassword.fulfilled, (state) => {
            state.isLoading = false;
            state.error = null;
        })
        builder.addCase(forgotPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to send reset email";
        })

        // resetPassword
        builder.addCase(resetPassword.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(resetPassword.fulfilled, (state) => {
            state.isLoading = false;
            state.error = null;
        })
        builder.addCase(resetPassword.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to reset password";
        })

        //google login
        builder.addCase(googleLogin.pending, (state) => {
            state.isLoading = true;
        })
        builder.addCase(googleLogin.fulfilled, (state) => {
            state.isLoading = false;
            // Page redirects, so no user data to set here
        })
        builder.addCase(googleLogin.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || action.error.message || "Google login failed";
        })

        // checkAuth
        builder.addCase(checkAuth.pending, (state) => {
            state.isLoading = true;
        })
        builder.addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.user = action.payload;
            state.error = null;
        })
        builder.addCase(checkAuth.rejected, (state) => {
            state.isLoading = false;
            state.user = null;
        })

        builder.addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.tickets = [];
            state.error = null;
        })

        // fetchUserTickets
        builder.addCase(fetchUserTickets.pending, (state) => {
            state.isLoading = true;
        })
        builder.addCase(fetchUserTickets.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tickets = action.payload;
        })
        builder.addCase(fetchUserTickets.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch tickets";
        })

        // fetchMyAccount
        builder.addCase(fetchMyAccount.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        builder.addCase(fetchMyAccount.fulfilled, (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.user = action.payload; // Updates user with aggregated data (addresses, orders)
            state.error = null;
        })
        builder.addCase(fetchMyAccount.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Failed to fetch account details";
        })
    }
})

export default authSlice.reducer;
