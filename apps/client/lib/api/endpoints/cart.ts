import { api } from "..";
import { Product } from "./products";

export interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
}

export const cartApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<{ status: boolean; data: Cart }, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<{ status: boolean; data: Cart; message: string }, { productId: string; quantity?: number }>({
      query: (body) => ({ url: "/cart", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation<{ status: boolean; data: Cart }, { itemId: string; quantity: number }>({
      query: ({ itemId, quantity }) => ({ url: `/cart/${itemId}`, method: "PUT", body: { quantity } }),
      invalidatesTags: ["Cart"],
    }),

    removeFromCart: builder.mutation<{ status: boolean; data: Cart }, string>({
      query: (itemId) => ({ url: `/cart/${itemId}`, method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<{ status: boolean; data: Cart }, void>({
      query: () => ({ url: "/cart", method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
