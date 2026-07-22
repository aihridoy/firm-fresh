import { api } from "..";
import { Pagination } from "./products";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "canceled";
export type PaymentMethod = "card" | "bkash" | "nagad";

export interface OrderItem {
  product: string;
  productName: string;
  productImage: string;
  farmer: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryDate?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentDetails?: { cardLast4?: string; transactionId?: string };
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  deliveryAddress: string;
  deliveryDate?: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: { cardLast4?: string; transactionId?: string };
  items?: { productId: string; quantity: number }[];
}

interface OrdersPageParams {
  page?: number;
  limit?: number;
}

const pageParams = (params?: OrdersPageParams) => {
  const query: Record<string, string> = {};
  if (params?.page) query.page = String(params.page);
  if (params?.limit) query.limit = String(params.limit);
  return query;
};

export const ordersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<{ status: boolean; data: Order; message: string }, CreateOrderPayload>({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Cart", { type: "Order", id: "LIST" }, { type: "Order", id: "FARMER_LIST" }],
    }),

    getUserOrders: builder.query<{ status: boolean; data: Order[]; pagination: Pagination }, OrdersPageParams | void>({
      query: (params) => ({ url: "/orders", params: pageParams(params || undefined) }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((o) => ({ type: "Order" as const, id: o._id })), { type: "Order" as const, id: "LIST" }]
          : [{ type: "Order" as const, id: "LIST" }],
    }),

    getFarmerOrders: builder.query<{ status: boolean; data: Order[]; pagination: Pagination }, OrdersPageParams | void>({
      query: (params) => ({ url: "/orders/farmer", params: pageParams(params || undefined) }),
      providesTags: (result) =>
        result?.data
          ? [...result.data.map((o) => ({ type: "Order" as const, id: o._id })), { type: "Order" as const, id: "FARMER_LIST" }]
          : [{ type: "Order" as const, id: "FARMER_LIST" }],
    }),

    getOrderById: builder.query<{ status: boolean; data: Order }, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    updateOrderStatus: builder.mutation<{ status: boolean; data: Order }, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Order", id: "FARMER_LIST" },
        { type: "Order", id: "LIST" },
      ],
    }),

    cancelOrder: builder.mutation<{ status: boolean; data: Order }, string>({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Order", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetUserOrdersQuery,
  useGetFarmerOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation,
} = ordersApi;
