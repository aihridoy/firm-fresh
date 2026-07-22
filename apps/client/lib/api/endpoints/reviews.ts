import { api } from "..";
import { Pagination } from "./products";

export interface ReviewUser {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface Review {
  _id: string;
  user: ReviewUser | string;
  product: string;
  order: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export const reviewsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      { status: boolean; data: Review[]; pagination: Pagination },
      { productId: string; page?: number; limit?: number }
    >({
      query: ({ productId, page, limit }) => {
        const query: Record<string, string> = {};
        if (page) query.page = String(page);
        if (limit) query.limit = String(limit);
        return { url: `/reviews/product/${productId}`, params: query };
      },
      providesTags: (result, error, { productId }) => [{ type: "Review", id: productId }],
    }),

    getUserReviews: builder.query<{ status: boolean; data: Review[] }, string>({
      query: (userId) => `/reviews/user/${userId}`,
      providesTags: [{ type: "Review", id: "USER_LIST" }],
    }),

    createReview: builder.mutation<
      { status: boolean; data: Review; message: string },
      { productId: string; orderId: string; rating: number; comment: string }
    >({
      query: (body) => ({ url: "/reviews", method: "POST", body }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Product", id: productId },
      ],
    }),

    updateReview: builder.mutation<
      { status: boolean; data: Review },
      { id: string; productId: string; rating?: number; comment?: string }
    >({
      query: ({ id, ...body }) => {
        delete (body as { productId?: string }).productId;
        return { url: `/reviews/${id}`, method: "PUT", body };
      },
      invalidatesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Product", id: productId },
      ],
    }),

    deleteReview: builder.mutation<{ status: boolean; message: string }, { id: string; productId: string }>({
      query: ({ id }) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Review", id: productId },
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetUserReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi;
