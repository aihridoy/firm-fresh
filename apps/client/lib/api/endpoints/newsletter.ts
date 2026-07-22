import { api } from "..";

export const newsletterApi = api.injectEndpoints({
  endpoints: (builder) => ({
    subscribeNewsletter: builder.mutation<{ status: boolean; message: string }, string>({
      query: (email) => ({
        url: "/newsletter",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const { useSubscribeNewsletterMutation } = newsletterApi;
