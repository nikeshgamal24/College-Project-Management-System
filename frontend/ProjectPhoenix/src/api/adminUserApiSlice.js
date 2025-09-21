import { apiSlice } from "./apiSlice";

export const adminUserApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create single user
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/admin/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // Create multiple users (bulk)
    createBulkUsers: builder.mutation({
      query: (usersData) => ({
        url: "/admin/users/bulk",
        method: "POST",
        body: usersData,
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // Get all users with filtering
    getAllUsers: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        
        if (params.role) queryParams.append('role', params.role);
        if (params.status) queryParams.append('status', params.status);
        if (params.search) queryParams.append('search', params.search);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);

        return {
          url: `/admin/users?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["AdminUsers"],
    }),

    // Update user details
    updateUser: builder.mutation({
      query: ({ userId, userData, role }) => ({
        url: `/admin/users/${userId}?role=${role}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["AdminUsers"],
    }),


    // Reset user password
    resetUserPassword: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}/reset-password?role=${role}`,
        method: "PUT",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: ({ userId, role }) => ({
        url: `/admin/users/${userId}?role=${role}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    // Change temporary password (for users)
    changeTemporaryPassword: builder.mutation({
      query: (passwordData) => ({
        url: "/auth/change-temporary-password",
        method: "POST",
        body: passwordData,
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useCreateBulkUsersMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useResetUserPasswordMutation,
  useDeleteUserMutation,
  useChangeTemporaryPasswordMutation,
} = adminUserApiSlice;

