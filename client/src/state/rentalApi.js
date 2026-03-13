// client/src/state/rentalApi.js
import { api } from "./api";

export const rentalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyRentals: builder.query({
      query: () => ({
        url: "/rentals/me",
        method: "GET",
      }),
      providesTags: ["Rental"],
    }),

    getRentalById: builder.query({
      query: (id) => ({
        url: `/rentals/${id}`,
        method: "GET",
      }),
      providesTags: ["Rental"],
    }),

    cancelRental: builder.mutation({
      query: ({ rentalId, cancellationReason }) => ({
        url: `/rentals/${rentalId}/cancel`,
        method: "PATCH",
        body: { cancellationReason },
      }),
      invalidatesTags: ["Rental"],
    }),

    markRentalCompleted: builder.mutation({
      query: ({ rentalId, completionNotes }) => ({
        url: `/rentals/${rentalId}/complete`,
        method: "PATCH",
        body: { completionNotes },
      }),
      invalidatesTags: ["Rental"],
    }),

    createListingReviewForRental: builder.mutation({
      query: ({ rentalId, ...body }) => ({
        url: `/rentals/${rentalId}/reviews`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Rental", "Listing"],
    }),

    createBorrowerRatingForRental: builder.mutation({
      query: ({ rentalId, ...body }) => ({
        url: `/rentals/${rentalId}/borrower-rating`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Rental"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyRentalsQuery,
  useGetRentalByIdQuery,
  useCancelRentalMutation,
  useMarkRentalCompletedMutation,
  useCreateListingReviewForRentalMutation,
  useCreateBorrowerRatingForRentalMutation,
} = rentalApi;
