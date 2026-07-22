import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { setAccessToken, logout, AuthState } from "./endpoints/userSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  prepareHeaders: (headers) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wraps the base query: on a 401, tries to mint a new access token from the
// stored refresh token and retries the original request once.
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state = api.getState() as { user: AuthState };
    const refreshToken = state.user.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/refresh-token", method: "POST", body: { refreshToken } },
        api,
        extraOptions
      );

      const refreshData = refreshResult.data as { status: boolean; data?: { token: string } } | undefined;

      if (refreshData?.status && refreshData.data?.token) {
        api.dispatch(setAccessToken(refreshData.data.token));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Product", "Cart", "Order", "Review", "Favorite"],
  endpoints: () => ({}),
});
