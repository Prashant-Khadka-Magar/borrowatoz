import { api } from "./api";

export const listingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    browseListings: builder.query({
      query: (params = {}) => ({
        url: "/listings",
        method: "GET",
        params,
      }),
      providesTags: ["Listings"],
    }),

    getListingById: builder.query({
      query: (id) => ({
        url: `/listings/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Listing", id }],
    }),

    getCategories: builder.query({
      query: () => ({
        url: "/categories",
        method: "GET",
      }),
      providesTags: ["Categories"],
    }),
  }),
   overrideExisting: false,
});

export const {
  useBrowseListingsQuery,
  useGetListingByIdQuery,
  useGetCategoriesQuery,
} = listingApi;
