import { apiSlice } from "@/api/apiSlice";

export const studentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTargetedEvent: builder.query({
      query: () => ({
        url: "/student/event",
        method: "GET",
      }),
    }),

    getProject: builder.query({
      query: (id) => ({
        url: `/student/project/${id}`,
        method: "GET",
      }),
      providesTags: ["Project"],
    }),
    getEvents: builder.query({
      query: () => ({
        url: "/student/events",
        method: "GET",
      }),
      providesTags: ["AllEvents"],
    }),
    updateStudent: builder.mutation({
      query: (credentials) => ({
        url: `/student/students/${credentials.id}`,
        method: "PUT",
        body: { ...credentials.data },
      }),
    }),

    getSelectionStudents: builder.query({
      query: () => ({
        url: "/student/team/students",
        method: "GET",
      }),
    }),

    getProjectProgress: builder.query({
      query: (credentials) => ({
        url: `/student/progress-log/${credentials}`,
        method: "GET",
      }),
      providesTags: ["Progress"],
    }),
    createProgress: builder.mutation({
      query: (credentials) => ({
        url: `/student/progress-log/create`,
        method: "POST",
        body: { ...credentials },
      }),
      invalidatesTags: ["Progress", "Project"],
    }),
    getArchive: builder.query({
      query: () => ({
        url: "/student/archive",
        method: "GET",
      }),
    }),
    getArchiveProject: builder.query({
      query: (id) => ({
        url: `/student/archive/${id}`,
        method: "GET",
      }),
      // Transform the response to handle error cases properly
      transformResponse: (response, meta, arg) => {
        // If the response has an error status, throw an error
        if (meta?.response?.status >= 400) {
          throw new Error(response?.message || 'Failed to fetch project');
        }
        return response;
      },
      // Handle errors properly
      transformErrorResponse: (response, meta, arg) => {
        return {
          status: meta?.response?.status,
          data: response,
          message: response?.message || 'An error occurred while fetching the project'
        };
      },
    }),
    createProject: builder.mutation({
      query: (credentials) => ({
        url: `/student/team/create`,
        method: "POST",
        body: { ...credentials },
      }),
    }),

    submitReport: builder.mutation({
      query: ({ file, userProject, submittedBy, submittedOn }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("submittedBy", submittedBy);
        formData.append("submittedOn", submittedOn);
        return {
          url: `/student/team/report/${userProject}`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Project"],
    }),

    // Profile management endpoints
    getStudentProfile: builder.query({
      query: (id) => ({
        url: `/student/profile/${id}`,
        method: "GET",
      }),
      providesTags: ["StudentProfile"],
    }),

    updateStudentProfile: builder.mutation({
      query: ({ id, data }) => ({
        url: `/student/profile/${id}`,
        method: "PUT",
        body: data,
      }),
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled, getState }) {
        // Optimistically update the profile cache
        const patchResult = dispatch(
          studentApiSlice.util.updateQueryData('getStudentProfile', id, (draft) => {
            if (draft?.data) {
              Object.assign(draft.data, data);
            }
          })
        );
        
        try {
          await queryFulfilled;
          // Query succeeded, the optimistic update will be replaced with real data
        } catch {
          // Query failed, revert the optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: ["StudentProfile"],
    }),

    updateStudentPhoto: builder.mutation({
      query: ({ id, photo }) => {
        const formData = new FormData();
        formData.append("photo", photo);
        return {
          url: `/student/profile/${id}/photo`,
          method: "PUT",
          body: formData,
        };
      },
      // Optimistic update to immediately show the new photo
      async onQueryStarted({ id, photo }, { dispatch, queryFulfilled, getState }) {
        // Optimistically update the profile cache
        const patchResult = dispatch(
          studentApiSlice.util.updateQueryData('getStudentProfile', id, (draft) => {
            if (draft?.data) {
              // Create a temporary URL for the new photo
              const tempPhotoUrl = URL.createObjectURL(photo);
              draft.data.photo = tempPhotoUrl;
            }
          })
        );
        
        try {
          await queryFulfilled;
          // Query succeeded, the optimistic update will be replaced with real data
        } catch {
          // Query failed, revert the optimistic update
          patchResult.undo();
        }
      },
      invalidatesTags: ["StudentProfile"],
    }),

    // Step 1: Request password change OTP
    requestPasswordChangeOTP: builder.mutation({
      query: ({ id, currentPassword, newPassword, confirmPassword }) => ({
        url: `/student/profile/${id}/password/request-otp`,
        method: "POST",
        body: { currentPassword, newPassword, confirmPassword },
      }),
    }),

    // Step 2: Change password with OTP
    changeStudentPassword: builder.mutation({
      query: ({ id, otp, newPassword }) => ({
        url: `/student/profile/${id}/password/${otp}`,
        method: "PUT",
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useUpdateStudentMutation,
  useGetEventsQuery,
  useGetTargetedEventQuery,
  useGetProjectQuery,
  useGetSelectionStudentsQuery,
  useCreateProjectMutation,
  useSubmitReportMutation,
  // Profile management hooks
  useGetStudentProfileQuery,
  useUpdateStudentProfileMutation,
  useUpdateStudentPhotoMutation,
  useRequestPasswordChangeOTPMutation,
  useChangeStudentPasswordMutation,
  useGetArchiveQuery,
  useGetArchiveProjectQuery,
  useGetProjectProgressQuery,
  useCreateProgressMutation,
} = studentApiSlice;
