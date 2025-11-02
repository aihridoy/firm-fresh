import { api } from "..";
import { setCredentials, updateUserProfile } from "./userSlice";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Register new user (customer or farmer)
    registerUser: builder.mutation({
      query: (formData) => ({
        url: "/register",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
      // Store token after successful registration
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status && data.data.token) {
            // Use Redux action to set credentials
            dispatch(
              setCredentials({
                user: data.data,
                token: data.data.token,
              })
            );
          }
        } catch (error) {
          console.error("Registration failed:", error);
        }
      },
    }),

    // Login user
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
      // Store token after successful login
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status && data.data.token) {
            // Use Redux action to set credentials
            dispatch(
              setCredentials({
                user: data.data,
                token: data.data.token,
              })
            );
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),

    // Forgot password - Request reset link
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),

    // Reset password - Set new password with token
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: "/reset-password",
        method: "POST",
        body: { token, newPassword },
      }),
    }),

    // Get user by ID
    getUserById: builder.query({
      query: (id) => `/user/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    // Get user by email
    getUserByEmail: builder.query({
      query: (email) => `/user/email/${email}`,
      providesTags: (result, error, email) => [{ type: "User", id: email }],
    }),

    // Get all farmers
    getAllFarmers: builder.query({
      query: () => "/farmers",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }: { _id: string }) => ({
                type: "User",
                id: _id,
              })),
              { type: "User", id: "FARMERS_LIST" },
            ]
          : [{ type: "User", id: "FARMERS_LIST" }],
    }),

    // Update user profile
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/user/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
      // Update stored user data after successful update
      async onQueryStarted({ dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.status) {
            // Update user profile in Redux
            dispatch(updateUserProfile(data.data));
          }
        } catch (error) {
          console.error("Update failed:", error);
        }
      },
    }),

    // Change password
    changePassword: builder.mutation({
      query: ({ id, currentPassword, newPassword }) => ({
        url: `/user/${id}/password`,
        method: "PUT",
        body: { currentPassword, newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "User", id }],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "User", id }],
      // Clear stored data after successful deletion
      async onQueryStarted(id, { queryFulfilled }) {
        try {
          await queryFulfilled;
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        } catch (error) {
          console.error("Delete failed:", error);
        }
      },
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetUserByIdQuery,
  useGetUserByEmailQuery,
  useGetAllFarmersQuery,
  useUpdateUserMutation,
  useChangePasswordMutation,
  useDeleteUserMutation,
} = usersApi;
