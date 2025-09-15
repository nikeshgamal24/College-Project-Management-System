import { apiSlice } from "./apiSlice";

export const ticketApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all tickets with filtering and pagination
    getAllTickets: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add all parameters to search params
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        
        return {
          url: `/tickets?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tickets"],
    }),

    // Get single ticket by ID
    getTicketById: builder.query({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Tickets", id }],
    }),

    // Get ticket statistics
    getTicketStatistics: builder.query({
      query: () => ({
        url: "/tickets/statistics",
        method: "GET",
      }),
      providesTags: ["TicketStatistics"],
    }),

    // Create new ticket
    createTicket: builder.mutation({
      query: (ticketData) => ({
        url: "/tickets",
        method: "POST",
        body: ticketData,
      }),
      invalidatesTags: ["Tickets", "TicketStatistics"],
    }),

    // Update ticket
    updateTicket: builder.mutation({
      query: ({ id, ...ticketData }) => ({
        url: `/tickets/${id}`,
        method: "PUT",
        body: ticketData,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Tickets",
        { type: "Tickets", id },
        "TicketStatistics",
      ],
    }),

    // Add comment to ticket
    addComment: builder.mutation({
      query: ({ id, ...commentData }) => ({
        url: `/tickets/${id}/comments`,
        method: "POST",
        body: commentData,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Tickets",
        { type: "Tickets", id },
      ],
    }),

    // Update comment
    updateComment: builder.mutation({
      query: ({ ticketId, commentId, message }) => ({
        url: `/tickets/${ticketId}/comments/${commentId}`,
        method: "PUT",
        body: { message },
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        "Tickets",
        { type: "Tickets", id: ticketId },
      ],
    }),

    // Delete comment
    deleteComment: builder.mutation({
      query: ({ ticketId, commentId }) => ({
        url: `/tickets/${ticketId}/comments/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { ticketId }) => [
        "Tickets",
        { type: "Tickets", id: ticketId },
      ],
    }),

    // Delete ticket
    deleteTicket: builder.mutation({
      query: (id) => ({
        url: `/tickets/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tickets", "TicketStatistics"],
    }),

    // Get tickets by status (convenience methods)
    getActiveTickets: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.append("status", "new,in_progress");
        
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        
        return {
          url: `/tickets?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tickets"],
    }),

    getCompletedTickets: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.append("status", "resolved,closed");
        
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        
        return {
          url: `/tickets?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tickets"],
    }),

    // Get tickets by priority
    getUrgentTickets: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        searchParams.append("priority", "urgent");
        
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        
        return {
          url: `/tickets?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tickets"],
    }),

    // Get tickets by category
    getTicketsByCategory: builder.query({
      query: ({ category, ...params }) => {
        const searchParams = new URLSearchParams();
        searchParams.append("category", category);
        
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        
        return {
          url: `/tickets?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tickets"],
    }),

    // Get tickets assigned to specific admin
    getAssignedTickets: builder.query({
      query: (adminId) => ({
        url: `/tickets?assignedTo=${adminId}`,
        method: "GET",
      }),
      providesTags: ["Tickets"],
    }),

    // Get tickets submitted by specific user
    getSubmittedTickets: builder.query({
      query: (userId) => ({
        url: `/tickets?submittedBy=${userId}`,
        method: "GET",
      }),
      providesTags: ["Tickets"],
    }),

    // Get current user's tickets (convenience method)
    getMyTickets: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            searchParams.append(key, params[key]);
          }
        });
        
        return {
          url: `/tickets/my-tickets?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Tickets"],
    }),
  }),
});

export const {
  useGetAllTicketsQuery,
  useGetTicketByIdQuery,
  useGetTicketStatisticsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAddCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useDeleteTicketMutation,
  useGetActiveTicketsQuery,
  useGetCompletedTicketsQuery,
  useGetUrgentTicketsQuery,
  useGetTicketsByCategoryQuery,
  useGetAssignedTicketsQuery,
  useGetSubmittedTicketsQuery,
  useGetMyTicketsQuery,
} = ticketApiSlice;

