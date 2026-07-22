import { api } from "..";
import { Product } from "./products";

export interface Favorite {
  _id: string;
  user: string;
  product: Product;
  createdAt: string;
}

export const favoritesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFavorites: builder.query<{ status: boolean; data: Favorite[] }, void>({
      query: () => "/favorites",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((f) => ({ type: "Favorite" as const, id: f.product._id })),
              { type: "Favorite" as const, id: "LIST" },
            ]
          : [{ type: "Favorite" as const, id: "LIST" }],
    }),

    toggleFavorite: builder.mutation<{ status: boolean; favorited: boolean; message: string }, string>({
      query: (productId) => ({ url: "/favorites", method: "POST", body: { productId } }),
      invalidatesTags: (result, error, productId) => [
        { type: "Favorite", id: productId },
        { type: "Favorite", id: "LIST" },
      ],
    }),

    checkFavorite: builder.query<{ status: boolean; favorited: boolean }, string>({
      query: (productId) => `/favorites/check/${productId}`,
      providesTags: (result, error, productId) => [{ type: "Favorite", id: productId }],
    }),
  }),
});

export const { useGetFavoritesQuery, useToggleFavoriteMutation, useCheckFavoriteQuery } = favoritesApi;
