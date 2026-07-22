import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the User type
export interface User {
  _id: string;
  userType: "customer" | "farmer";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bio?: string;
  profilePicture?: string;
  farmerDetails?: {
    farmName: string;
    specialization: string;
    farmSize: {
      value: number;
      unit: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

// Define the auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// Initialize state from localStorage (if available)
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        };
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
  }

  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = getInitialState();

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set user credentials (login/register)
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        if (action.payload.refreshToken) {
          localStorage.setItem("refreshToken", action.payload.refreshToken);
        }
      }
    },

    // Set a freshly-minted access token (from the refresh-token flow)
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload);
      }
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        // Update in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      }
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    },

    // Hydrate state (useful for SSR/initial load)
    hydrateAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            state.user = JSON.parse(userStr);
            state.token = token;
            state.refreshToken = refreshToken;
            state.isAuthenticated = true;
          } catch (error) {
            console.error("Failed to hydrate auth state:", error);
          }
        }
      }
    },
  },
});

// Export actions
export const { setCredentials, setAccessToken, updateUserProfile, logout, hydrateAuth } =
  userSlice.actions;

// Export selectors
export const selectCurrentUser = (state: { user: AuthState }) =>
  state.user.user;
export const selectCurrentToken = (state: { user: AuthState }) =>
  state.user.token;
export const selectIsAuthenticated = (state: { user: AuthState }) =>
  state.user.isAuthenticated;

// Export reducer
export default userSlice.reducer;
