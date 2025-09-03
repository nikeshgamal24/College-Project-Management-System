import { apiSlice } from '../../api/apiSlice';

export const meetingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get meetings for current user
    getMeetings: builder.query({
      query: ({ startDate, endDate, status, meetingType } = {}) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (status) params.append('status', status);
        if (meetingType) params.append('meetingType', meetingType);
        
        return {
          url: `/meetings?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Meeting'],
    }),

    // Get a specific meeting
    getMeeting: builder.query({
      query: (id) => ({
        url: `/meetings/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Meeting', id }],
    }),

    // Get available time slots
    getAvailableSlots: builder.query({
      query: ({ supervisorId, studentId, date, duration = 60 }) => {
        const params = new URLSearchParams();
        params.append('supervisorId', supervisorId);
        params.append('studentId', studentId);
        params.append('date', date);
        params.append('duration', duration);
        
        return {
          url: `/meetings/available-slots?${params.toString()}`,
          method: 'GET',
        };
      },
    }),

    // Create a new meeting
    createMeeting: builder.mutation({
      query: (meetingData) => ({
        url: '/meetings',
        method: 'POST',
        body: meetingData,
      }),
      invalidatesTags: ['Meeting'],
    }),

    // Update a meeting
    updateMeeting: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/meetings/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Meeting', id },
        'Meeting',
      ],
    }),

    // Cancel a meeting
    cancelMeeting: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/meetings/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Meeting', id },
        'Meeting',
      ],
    }),

    // Delete a meeting
    deleteMeeting: builder.mutation({
      query: (id) => ({
        url: `/meetings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Meeting', id },
        'Meeting',
      ],
    }),
  }),
});

export const {
  useGetMeetingsQuery,
  useGetMeetingQuery,
  useGetAvailableSlotsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useCancelMeetingMutation,
  useDeleteMeetingMutation,
} = meetingApiSlice;
