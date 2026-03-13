// client/src/state/messageApi.js
import { api } from "./api";

export const messageApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMyConversations: builder.query({
      query: (params = {}) => ({
        url: "/conversations/me",
        method: "GET",
        params,
      }),
      providesTags: ["Conversation"],
    }),

    getOrCreateConversationFromListing: builder.mutation({
      query: (listingId) => ({
        url: `/conversations/from-listing/${listingId}`,
        method: "POST",
      }),
      invalidatesTags: ["Conversation"],
    }),

    getConversationById: builder.query({
      query: (id) => ({
        url: `/conversations/${id}`,
        method: "GET",
      }),
      providesTags: ["Conversation"],
    }),

    getConversationMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 20 }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Message"],
    }),

    sendMessage: builder.mutation({
      query: ({ conversationId, text }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "POST",
        body: { text },
      }),
      invalidatesTags: ["Message", "Conversation"],
    }),

    markConversationRead: builder.mutation({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Message", "Conversation"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyConversationsQuery,
  useGetOrCreateConversationFromListingMutation,
  useGetConversationByIdQuery,
  useGetConversationMessagesQuery,
  useSendMessageMutation,
  useMarkConversationReadMutation,
} = messageApi;
