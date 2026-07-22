import { api } from "..";

export interface ProductImage {
  url: string;
  alt: string;
}

export interface ProductFarmer {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  createdAt?: string;
  farmerDetails?: {
    farmName: string;
    specialization: string;
    farmSize?: { value: number; unit: string };
  };
}

export interface Product {
  _id: string;
  farmer: ProductFarmer | string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  images: ProductImage[];
  features: string[];
  farmLocation: string;
  harvestDate?: string;
  isPublished: boolean;
  purchaseCount: number;
  avgRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetProductsParams {
  search?: string;
  category?: string;
  sort?: "price-asc" | "price-desc" | "newest" | "featured";
  page?: number;
  limit?: number;
  farmer?: string;
  location?: string;
  organic?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<{ status: boolean; data: Product[]; pagination: Pagination }, GetProductsParams | void>({
      query: (params) => {
        const query: Record<string, string> = {};
        if (params?.search) query.search = params.search;
        if (params?.category) query.category = params.category;
        if (params?.sort) query.sort = params.sort;
        if (params?.page) query.page = String(params.page);
        if (params?.limit) query.limit = String(params.limit);
        if (params?.farmer) query.farmer = params.farmer;
        if (params?.location) query.location = params.location;
        if (params?.organic) query.organic = "true";
        if (params?.minPrice) query.minPrice = String(params.minPrice);
        if (params?.maxPrice) query.maxPrice = String(params.maxPrice);
        return { url: "/products", params: query };
      },
      providesTags: (result) =>
        result?.data
          ? [...result.data.map(({ _id }) => ({ type: "Product" as const, id: _id })), { type: "Product" as const, id: "LIST" }]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getFeaturedProducts: builder.query<{ status: boolean; data: Product[] }, void>({
      query: () => "/products/featured",
      providesTags: [{ type: "Product", id: "FEATURED" }],
    }),

    getProductById: builder.query<{ status: boolean; data: Product }, string>({
      query: (id) => `/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    getFarmerProducts: builder.query<{ status: boolean; data: Product[]; count: number }, string>({
      query: (farmerId) => `/products/farmer/${farmerId}`,
      providesTags: (result, error, farmerId) => [{ type: "Product", id: `FARMER_${farmerId}` }],
    }),

    createProduct: builder.mutation<{ status: boolean; data: Product }, FormData>({
      query: (formData) => ({ url: "/products", method: "POST", body: formData }),
      invalidatesTags: [
        { type: "Product", id: "LIST" },
        { type: "Product", id: "FEATURED" },
      ],
    }),

    updateProduct: builder.mutation<{ status: boolean; data: Product }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({ url: `/products/${id}`, method: "PUT", body: formData }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    togglePublish: builder.mutation<{ status: boolean; data: Product }, string>({
      query: (id) => ({ url: `/products/${id}/publish`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<{ status: boolean; message: string }, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetFeaturedProductsQuery,
  useGetProductByIdQuery,
  useGetFarmerProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useTogglePublishMutation,
  useDeleteProductMutation,
} = productsApi;
