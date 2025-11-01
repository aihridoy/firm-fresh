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
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Initialize state from localStorage (if available)
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          user,
          token,
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
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Store in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
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
      state.isAuthenticated = false;

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },

    // Hydrate state (useful for SSR/initial load)
    hydrateAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            state.user = JSON.parse(userStr);
            state.token = token;
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
export const { setCredentials, updateUserProfile, logout, hydrateAuth } =
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
