// client/src/state/rentalRequestApi.js
import { api } from "./api";

export const rentalRequestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createRentalRequest: builder.mutation({
      query: ({ listingId, ...body }) => ({
        url: `/rental-requests/listings/${listingId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["RentalRequest", "Rental"],
    }),

    getMyRequests: builder.query({
      query: () => ({
        url: "/rental-requests/me",
        method: "GET",
      }),
      providesTags: ["RentalRequest"],
    }),

    getIncomingRequest: builder.query({
      query: (status) => ({
        url: "/rental-requests/incoming",
        method: "GET",
        params: status ? { status } : undefined,
      }),
      providesTags: ["RentalRequest"],
    }),

    approveRentalRequest: builder.mutation({
      query: (requestId) => ({
        url: `/rental-requests/${requestId}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["RentalRequest", "Rental"],
    }),

    rejectRentalRequest: builder.mutation({
      query: ({ requestId, message }) => ({
        url: `/rental-requests/${requestId}/reject`,
        method: "PATCH",
        body: { message },
      }),
      invalidatesTags: ["RentalRequest"],
    }),

    cancelRentalRequest: builder.mutation({
      query: (requestId) => ({
        url: `/rental-requests/${requestId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["RentalRequest"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateRentalRequestMutation,
  useGetMyRequestsQuery,
  useGetIncomingRequestQuery,
  useApproveRentalRequestMutation,
  useRejectRentalRequestMutation,
  useCancelRentalRequestMutation,
} = rentalRequestApi;
