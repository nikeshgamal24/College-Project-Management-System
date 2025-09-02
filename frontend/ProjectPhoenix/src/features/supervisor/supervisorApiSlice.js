import { apiSlice } from "@/api/apiSlice";

export const supervisorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSupervisorArchiveProjects: builder.query({
      query: () => ({
        url: "supervisor/projects/archive",
        method: "GET",
      }),
    }),
    getSupervisorAssignedProjects: builder.query({
      query: () => ({
        url: "supervisor/projects/active",
        method: "GET",
      }),
    }),
    getSupervisorAssignedProjectDetails: builder.query({
      query: (id) => ({
        url: `supervisor/project/${id}`,
        method: "GET",
      }),
      providesTags: ["AssignedProject"],
    }),
    getSupervisorEvents: builder.query({
      query: () => ({
        url: "supervisor/events/active",
        method: "GET",
      }),
    }),

    // Profile Management Endpoints
    getSupervisorProfile: builder.query({
      query: (id) => ({
        url: `supervisor/supervisors/${id}`,
        method: "GET",
      }),
      providesTags: ["SupervisorProfile"],
    }),
    
    updateSupervisorProfile: builder.mutation({
      query: (credentials) => ({
        url: `supervisor/supervisors/${credentials.id}`,
        method: "PUT",
        body: { ...credentials.data },
      }),
      invalidatesTags: ["SupervisorProfile"],
    }),
    
    updateSupervisorPhoto: builder.mutation({
      query: (credentials) => ({
        url: `supervisor/supervisors/${credentials.id}/photo`,
        method: "PUT",
        body: credentials.data,
      }),
      invalidatesTags: ["SupervisorProfile"],
    }),

    // Password Management Endpoints
    requestSupervisorPasswordChangeOTP: builder.mutation({
      query: ({ id, currentPassword, newPassword, confirmPassword }) => ({
        url: `supervisor/profile/${id}/password/request-otp`,
        method: "POST",
        body: { currentPassword, newPassword, confirmPassword },
      }),
    }),
    
    changeSupervisorPasswordWithOTP: builder.mutation({
      query: ({ id, otp, newPassword }) => ({
        url: `supervisor/profile/${id}/password/${otp}`,
        method: "PUT",
        body: { newPassword },
      }),
    }),

    updateSupervisor: builder.mutation({
      query: (credentials) => ({
        url: `supervisor/supervisors/${credentials.id}`,
        method: "PUT",
        body: { ...credentials.data },
      }),
    }),
    verifyProgressLog: builder.mutation({
      query: (credentials) => ({
        url: `supervisor/supervisor/progress-log/verify/${credentials.id}`,
        method: "POST",
        body: { ...credentials },
      }),
      invalidatesTags: ["AssignedProject"],
    }),
    grantDefensePermission: builder.mutation({
      query: (credentials) => ({
        url: `supervisor/supervisor/progress-log/grant-approval/${credentials.id}`,
        method: "POST",
        body: { ...credentials },
      }),
      invalidatesTags: ["AssignedProject"],
    }),
    bulkVerifyProgressLogs: builder.mutation({
      query: (credentials) => ({
        url: "supervisor/supervisor/progress-log/bulk-verify",
        method: "POST",
        body: { ...credentials },
      }),
      invalidatesTags: ["AssignedProject"],
    }),
    addProgressLogComment: builder.mutation({
      query: (credentials) => ({
        url: `supervisor/supervisor/progress-log/${credentials.id}/comment`,
        method: "POST",
        body: { comment: credentials.comment },
      }),
      invalidatesTags: ["AssignedProject"],
    }),
  }),
});

export const {
  useUpdateSupervisorMutation,
  useGetSupervisorArchiveProjectsQuery,
  useGetSupervisorEventsQuery,
  useGetSupervisorAssignedProjectsQuery,
  useGetSupervisorAssignedProjectDetailsQuery,
  useVerifyProgressLogMutation,
  useGrantDefensePermissionMutation,
  useBulkVerifyProgressLogsMutation,
  useAddProgressLogCommentMutation,
  // Profile Management Hooks
  useGetSupervisorProfileQuery,
  useUpdateSupervisorProfileMutation,
  useUpdateSupervisorPhotoMutation,
  // Password Management Hooks
  useRequestSupervisorPasswordChangeOTPMutation,
  useChangeSupervisorPasswordWithOTPMutation,
} = supervisorApiSlice;
