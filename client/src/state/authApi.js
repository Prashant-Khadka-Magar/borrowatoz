import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: "/api/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    login: builder.mutation({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useSignupMutation, useLoginMutation } = authApi;
