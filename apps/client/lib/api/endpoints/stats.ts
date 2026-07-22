import { api } from "..";

export interface PublicStats {
  farmers: number;
  customers: number;
  products: number;
}

export const statsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPublicStats: builder.query<{ status: boolean; data: PublicStats }, void>({
      query: () => "/stats",
    }),
  }),
});

export const { useGetPublicStatsQuery } = statsApi;
