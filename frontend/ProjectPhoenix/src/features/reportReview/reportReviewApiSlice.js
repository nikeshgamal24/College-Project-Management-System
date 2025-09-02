import { apiSlice } from "@/api/apiSlice";

export const reportReviewApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Student endpoints
    submitReportForReview: builder.mutation({
      query: ({ reportFile, projectId, reportType, version }) => {
        const formData = new FormData();
        formData.append("reportFile", reportFile);
        formData.append("projectId", projectId);
        formData.append("reportType", reportType);
        if (version) formData.append("version", version);
        
        return {
          url: "report-review/student/submit",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["StudentReports", "Project"],
    }),

    getStudentReports: builder.query({
      query: ({ projectId, reportType } = {}) => {
        const params = new URLSearchParams();
        if (projectId) params.append("projectId", projectId);
        if (reportType) params.append("reportType", reportType);
        
        const url = `report-review/student/reports?${params.toString()}`;
        console.log("getStudentReports query URL:", url);
        
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["StudentReports"],
    }),

    respondToFeedback: builder.mutation({
      query: ({ id, responseComments }) => ({
        url: `report-review/student/respond/${id}`,
        method: "POST",
        body: { responseComments },
      }),
      invalidatesTags: ["StudentReports"],
    }),

    updateReport: builder.mutation({
      query: ({ id, reportFile, version }) => {
        const formData = new FormData();
        formData.append("reportFile", reportFile);
        if (version) formData.append("version", version);
        
        return {
          url: `report-review/student/update/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["StudentReports", "Project"],
    }),

    // Supervisor endpoints
    getReportsForReview: builder.query({
      query: ({ status, reportType } = {}) => {
        const params = new URLSearchParams();
        if (status) params.append("status", status);
        if (reportType) params.append("reportType", reportType);
        
        return {
          url: `report-review/supervisor/reports?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["SupervisorReports"],
    }),

    getReportForReview: builder.query({
      query: (id) => ({
        url: `report-review/supervisor/report/${id}`,
        method: "GET",
      }),
      providesTags: ["ReportReview"],
    }),

    addSectionFeedback: builder.mutation({
      query: ({ id, sectionTitle, pageNumber, comment, feedbackType, priority }) => ({
        url: `report-review/supervisor/feedback/${id}`,
        method: "POST",
        body: { sectionTitle, pageNumber, comment, feedbackType, priority },
      }),
      invalidatesTags: ["ReportReview", "SupervisorReports"],
    }),

    addOverallComments: builder.mutation({
      query: ({ id, overallComments }) => ({
        url: `report-review/supervisor/comments/${id}`,
        method: "POST",
        body: { overallComments },
      }),
      invalidatesTags: ["ReportReview", "SupervisorReports"],
    }),

    updateReportStatus: builder.mutation({
      query: ({ id, status, overallComments }) => ({
        url: `report-review/supervisor/status/${id}`,
        method: "PUT",
        body: { status, overallComments },
      }),
      invalidatesTags: ["ReportReview", "SupervisorReports", "StudentReports"],
    }),
  }),
});

export const {
  // Student hooks
  useSubmitReportForReviewMutation,
  useGetStudentReportsQuery,
  useRespondToFeedbackMutation,
  useUpdateReportMutation,
  // Supervisor hooks
  useGetReportsForReviewQuery,
  useGetReportForReviewQuery,
  useAddSectionFeedbackMutation,
  useAddOverallCommentsMutation,
  useUpdateReportStatusMutation,
} = reportReviewApiSlice;
