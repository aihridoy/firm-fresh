import { api } from "..";
import { Product, Pagination } from "./products";
import { Order, OrderStatus } from "./orders";
import { User } from "./userSlice";

export interface AdminDashboard {
  users: { total: number; customers: number; farmers: number; admins: number };
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: (Omit<Order, "user"> & { user: { firstName: string; lastName: string; email: string } | string })[];
  recentUsers: User[];
}

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface AdminProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  published?: string;
}

export interface AdminOrdersParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export type AdminOrder = Omit<Order, "user"> & {
  user: { _id: string; firstName: string; lastName: string; email: string } | string;
};
export type AdminProduct = Omit<Product, "farmer"> & {
  farmer: { _id: string; firstName: string; lastName: string; email: string } | string;
};

const toQuery = (params?: object) => {
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== "") query[key] = String(value);
  }
  return query;
};

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<{ status: boolean; data: AdminDashboard }, void>({
      query: () => "/admin/dashboard",
      providesTags: [
        { type: "User", id: "ADMIN" },
        { type: "Product", id: "ADMIN" },
        { type: "Order", id: "ADMIN" },
      ],
    }),

    getAdminUsers: builder.query<{ status: boolean; data: User[]; pagination: Pagination }, AdminUsersParams | void>({
      query: (params) => ({ url: "/admin/users", params: toQuery(params ?? undefined) }),
      providesTags: [{ type: "User", id: "ADMIN" }],
    }),

    updateAdminUser: builder.mutation<
      { status: boolean; data: User; message: string },
      { id: string; body: Partial<Pick<User, "firstName" | "lastName" | "phone" | "address" | "bio" | "userType">> }
    >({
      query: ({ id, body }) => ({ url: `/admin/users/${id}`, method: "PUT", body }),
      invalidatesTags: [{ type: "User", id: "ADMIN" }],
    }),

    deleteAdminUser: builder.mutation<{ status: boolean; message: string }, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "User", id: "ADMIN" }],
    }),

    getAdminProducts: builder.query<
      { status: boolean; data: AdminProduct[]; pagination: Pagination },
      AdminProductsParams | void
    >({
      query: (params) => ({ url: "/admin/products", params: toQuery(params ?? undefined) }),
      providesTags: [{ type: "Product", id: "ADMIN" }],
    }),

    deleteAdminProduct: builder.mutation<{ status: boolean; message: string }, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Product", id: "ADMIN" }, { type: "Product", id: "LIST" }],
    }),

    toggleAdminProductPublish: builder.mutation<{ status: boolean; data: Product; message: string }, string>({
      query: (id) => ({ url: `/admin/products/${id}/publish`, method: "PATCH" }),
      invalidatesTags: [{ type: "Product", id: "ADMIN" }, { type: "Product", id: "LIST" }],
    }),

    getAdminOrders: builder.query<
      { status: boolean; data: AdminOrder[]; pagination: Pagination },
      AdminOrdersParams | void
    >({
      query: (params) => ({ url: "/admin/orders", params: toQuery(params ?? undefined) }),
      providesTags: [{ type: "Order", id: "ADMIN" }],
    }),

    updateAdminOrderStatus: builder.mutation<
      { status: boolean; data: Order; message: string },
      { id: string; status: OrderStatus }
    >({
      query: ({ id, status }) => ({ url: `/admin/orders/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: [{ type: "Order", id: "ADMIN" }],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminProductsQuery,
  useDeleteAdminProductMutation,
  useToggleAdminProductPublishMutation,
  useGetAdminOrdersQuery,
  useUpdateAdminOrderStatusMutation,
} = adminApi;
