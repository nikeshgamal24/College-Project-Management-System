import { apiSlice } from './apiSlice';

export const noticeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notices with filtering and pagination (Admin only)
    getNotices: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add query parameters
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        
        return {
          url: `/notices?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Notice'],
    }),

    // Get a single notice by ID (Admin only)
    getNotice: builder.query({
      query: (id) => ({
        url: `/notices/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Notice', id }],
    }),

    // Get notice statistics (Admin only)
    getNoticeStats: builder.query({
      query: () => ({
        url: '/notices/stats',
        method: 'GET',
      }),
      providesTags: ['NoticeStats'],
    }),

    // Create a new notice (Admin only)
    createNotice: builder.mutation({
      query: (noticeData) => ({
        url: '/notices',
        method: 'POST',
        body: noticeData,
      }),
      invalidatesTags: ['Notice', 'NoticeStats'],
    }),

    // Update a notice (Admin only)
    updateNotice: builder.mutation({
      query: ({ id, ...noticeData }) => ({
        url: `/notices/${id}`,
        method: 'PUT',
        body: noticeData,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Notice',
        'NoticeStats',
        { type: 'Notice', id },
      ],
    }),

    // Delete a notice (Admin only)
    deleteNotice: builder.mutation({
      query: (id) => ({
        url: `/notices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notice', 'NoticeStats'],
    }),

    // Publish a notice (Admin only)
    publishNotice: builder.mutation({
      query: (id) => ({
        url: `/notices/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'Notice',
        'NoticeStats',
        { type: 'Notice', id },
      ],
    }),

    // Archive a notice (Admin only)
    archiveNotice: builder.mutation({
      query: (id) => ({
        url: `/notices/${id}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'Notice',
        'NoticeStats',
        { type: 'Notice', id },
      ],
    }),

    // Upload notice attachment (Admin only)
    uploadNoticeAttachment: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('attachment', file);
        
        return {
          url: '/notices/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetNoticesQuery,
  useGetNoticeQuery,
  useGetNoticeStatsQuery,
  useCreateNoticeMutation,
  useUpdateNoticeMutation,
  useDeleteNoticeMutation,
  usePublishNoticeMutation,
  useArchiveNoticeMutation,
  useUploadNoticeAttachmentMutation,
} = noticeApiSlice;
