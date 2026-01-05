import { api } from "./api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: "/user/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    login: builder.mutation({
      query: (body) => ({
        url: "/user/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    verifyOtp: builder.mutation({
      query: (body) => ({
        url: "/user/verify-otp",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/user/logout",
        method: "POST",
      }),
    }),

    me: builder.query({
      query: () => "/user/profile",
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useSignupMutation,
  useLoginMutation,
  useVerifyOtpMutation,
  useLogoutMutation,
  useMeQuery,
} = authApi;
