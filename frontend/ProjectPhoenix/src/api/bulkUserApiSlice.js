import { apiSlice } from './apiSlice';

export const bulkUserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all available user types
    getUserTypes: builder.query({
      query: () => '/admin/users/bulk/types',
      providesTags: ['UserTypes'],
    }),

    // Get user type information
    getUserTypeInfo: builder.query({
      query: (userType) => `/admin/users/bulk/types/${userType}`,
      providesTags: (result, error, userType) => [
        { type: 'UserTypeInfo', id: userType },
      ],
    }),

    // Generate CSV template
    generateCSVTemplate: builder.query({
      query: (userType) => `/admin/users/bulk/template/${userType}`,
      providesTags: (result, error, userType) => [
        { type: 'CSVTemplate', id: userType },
      ],
    }),

    // Download CSV template
    downloadCSVTemplate: builder.mutation({
      query: (userType) => ({
        url: `/admin/users/bulk/template/${userType}/download`,
        method: 'GET',
        responseType: 'blob',
      }),
    }),

    // Upload and process CSV file
    uploadAndProcessCSV: builder.mutation({
      query: ({ file, userType }) => {
        const formData = new FormData();
        formData.append('csvFile', file);
        formData.append('userType', userType);
        
        return {
          url: '/admin/users/bulk/upload',
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['BulkUsers'],
    }),

    // Process CSV text
    processCSVText: builder.mutation({
      query: ({ csvText, userType }) => ({
        url: '/admin/users/bulk/process-text',
        method: 'POST',
        body: { csvText, userType },
      }),
      invalidatesTags: ['BulkUsers'],
    }),

    // Validate CSV data
    validateCSVData: builder.mutation({
      query: ({ csvText, userType }) => ({
        url: '/admin/users/bulk/validate',
        method: 'POST',
        body: { csvText, userType },
      }),
    }),

    // Create users from CSV data
    createUsersFromCSV: builder.mutation({
      query: ({ users, userType }) => ({
        url: '/admin/users/bulk/create',
        method: 'POST',
        body: { users, userType },
      }),
      invalidatesTags: ['Users', 'BulkUsers'],
    }),

    // Enhanced bulk user creation (combines validation and creation)
    createBulkUsersEnhanced: builder.mutation({
      query: ({ users, userType }) => ({
        url: '/admin/users/bulk/create',
        method: 'POST',
        body: { users, userType },
      }),
      invalidatesTags: ['Users', 'BulkUsers'],
    }),
  }),
});

export const {
  useGetUserTypesQuery,
  useGetUserTypeInfoQuery,
  useGenerateCSVTemplateQuery,
  useDownloadCSVTemplateMutation,
  useUploadAndProcessCSVMutation,
  useProcessCSVTextMutation,
  useValidateCSVDataMutation,
  useCreateUsersFromCSVMutation,
  useCreateBulkUsersEnhancedMutation,
} = bulkUserApiSlice;

