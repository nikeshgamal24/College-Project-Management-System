import { apiSlice } from "@/api/apiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllEvents: builder.query({
      query: () => ({
        url: "/event/events",
        method: "GET",
      }),
      providesTags: ["Events"],
    }),
    getEvent: builder.query({
      query: (id) => ({
        url: `/event/events/${id}`,
        method: "GET",
      }),
      providesTags: ["Event"],
    }),
    createEvent: builder.mutation({
      query: (credentials) => ({
        url: "/event/create",
        method: "POST",
        body: { ...credentials },
      }),
      invalidatesTags: ["Events"],
    }),
    extendDeadline: builder.mutation({
      query: (credentials) => ({
        url: "/event/event/extendDeadline",
        method: "PATCH",
        body: { ...credentials },
      }),
      invalidatesTags: ["Event"],
    }),
    createEvaluator: builder.mutation({
      query: (credentials) => ({
        url: "/event/evaluator/create",
        method: "POST",
        body: { ...credentials },
      }),
      invalidatesTags: ["Evaluators"],
    }),

    getAllEvaluator: builder.query({
      query: () => ({
        url: "/event/evaluators",
        method: "GET",
      }),
      providesTags: ["Evaluators"],
    }),

    getAllSupervisors: builder.query({
      query: () => ({
        url: "/event/event/supervisors",
        method: "GET",
      }),
      providesTags: ["Supervisors"],
    }),
    getAllDefenses: builder.query({
      query: () => ({
        url: "/event/defense/defenses",
        method: "GET",
      }),
      providesTags: ["Defenses"],
    }),
    getDefenseDetail: builder.query({
      query: (credentials) => ({
        url: `/event/defense/${credentials}`,
        method: "GET",
      }),
    }),
    createDefense: builder.mutation({
      query: (credentials) => ({
        url: "/event/defense/create",
        method: "POST",
        body: { ...credentials },
      }),
      invalidatesTags: ["Defenses", "Events", "Event"],
    }),
    matchProjects: builder.mutation({
      query: (credentials) => ({
        url: "event/event/matchProjects",
        method: "POST",
        body: credentials,
      }),
    }),
    submitMatchedProjects: builder.mutation({
      query: (credentials) => ({
        url: "event/event/saveMatchedProjects",
        method: "POST",
        body: credentials,
      }),
    }),
    createDefenseData: builder.query({
      query: () => ({
        url: "/event/defense/create",
        method: "GET",
      }),
    }),
    getAdminProjectId: builder.query({
      query: (id) => ({
        url: `event/event/project/${id}`,
        method: "GET",
      }),
      providesTags: ["Project"],
    }),
    getAdminDashboard: builder.query({
      query: () => ({
        url: "event/event/dashboard/",
        method: "GET",
      }),
      providesTags: ["Defenses", "Events"],
    }),
    getAllProjects: builder.query({
      query: () => ({
        url: "/event/event/projects",
        method: "GET",
      }),
    }),
    getAllStudents: builder.query({
      query: () => ({
        url: "/event/event/students",
        method: "GET",
      }),
    }),
    eventResult: builder.query({
      query: (id) => ({
        url: `/event/event/result/${id}`,
        method: "GET",
      }),
    }),
    // ==================== ADMIN ACCESS CODE MANAGEMENT ====================
    getEvaluatorsWithAccessCodes: builder.query({
      query: () => ({
        url: "/event/admin/evaluators/access-codes",
        method: "GET",
      }),
      providesTags: ["EvaluatorAccessCodes"],
    }),
    getEvaluatorAccessCodes: builder.query({
      query: (evaluatorId) => ({
        url: `/event/admin/evaluators/${evaluatorId}/access-codes`,
        method: "GET",
      }),
      providesTags: ["EvaluatorAccessCodes"],
    }),
    regenerateAccessCode: builder.mutation({
      query: ({ evaluatorId, defenseId }) => ({
        url: `/event/admin/evaluators/${evaluatorId}/defense/${defenseId}/regenerate-code`,
        method: "PUT",
      }),
      invalidatesTags: ["EvaluatorAccessCodes"],
    }),
    resendNotification: builder.mutation({
      query: ({ evaluatorId, defenseId }) => ({
        url: `/event/admin/evaluators/${evaluatorId}/defense/${defenseId}/resend-notification`,
        method: "POST",
      }),
    }),
    getDefenseEvaluators: builder.query({
      query: (defenseId) => ({
        url: `/event/admin/defense/${defenseId}/evaluators`,
        method: "GET",
      }),
      providesTags: ["DefenseEvaluators"],
    }),
    updateDefenseTime: builder.mutation({
      query: ({ defenseId, defenseTime, defenseDate, reason }) => ({
        url: `/event/defense/update-time/${defenseId}`,
        method: "PUT",
        body: { defenseTime, defenseDate, reason },
      }),
      invalidatesTags: ["Defenses", "Events"],
    }),
    // ==================== ADMIN PROFILE MANAGEMENT ====================
    getAdminProfile: builder.query({
      query: (id) => ({
        url: `/admin/profile/${id}`,
        method: "GET",
      }),
      providesTags: ["AdminProfile"],
    }),
    updateAdminProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/profile/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdminProfile"],
    }),
    updateAdminPhoto: builder.mutation({
      query: ({ id, photo }) => {
        const formData = new FormData();
        formData.append("photo", photo);
        return {
          url: `/admin/profile/${id}/photo`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["AdminProfile"],
    }),
    requestAdminPasswordChangeOTP: builder.mutation({
      query: ({ id, currentPassword, newPassword, confirmPassword }) => ({
        url: `/admin/profile/${id}/password/request-otp`,
        method: "POST",
        body: { currentPassword, newPassword, confirmPassword },
      }),
    }),
    changeAdminPassword: builder.mutation({
      query: ({ id, otp, newPassword }) => ({
        url: `/admin/profile/${id}/password/${otp}`,
        method: "PUT",
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useGetAllEventsQuery,
  useCreateEventMutation,
  useGetEventQuery,
  useCreateEvaluatorMutation,
  useGetAllEvaluatorQuery,
  useGetAllDefensesQuery,
  useCreateDefenseDataQuery,
  useCreateDefenseMutation,
  useExtendDeadlineMutation,
  useGetDefenseDetailQuery,
  useGetAllProjectsQuery,
  useGetAllStudentsQuery,
  useGetAllSupervisorsQuery,
  useMatchProjectsMutation,
  useSubmitMatchedProjectsMutation,
  useGetAdminProjectIdQuery,
  useGetAdminDashboardQuery,
  useEventResultQuery,
  // Admin access code management hooks
  useGetEvaluatorsWithAccessCodesQuery,
  useGetEvaluatorAccessCodesQuery,
  useRegenerateAccessCodeMutation,
  useResendNotificationMutation,
  useGetDefenseEvaluatorsQuery,
  useUpdateDefenseTimeMutation,
  // Admin profile management hooks
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
  useUpdateAdminPhotoMutation,
  useRequestAdminPasswordChangeOTPMutation,
  useChangeAdminPasswordMutation,
} = adminApiSlice;
