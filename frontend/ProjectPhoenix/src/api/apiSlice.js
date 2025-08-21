import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "../features/auth/authSlice";
import { API_BASE_URL } from "@/lib/config";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  console.log("API request result:", args, result);
  
  // Check for 403 (Forbidden) or 401 (Unauthorized) status codes
  if (result?.error?.status === 403 || result?.error?.status === 401) {
    console.log("Token expired or invalid, attempting refresh...");
    
    // Try to get a new token
    const refreshResult = await baseQuery("/refresh", api, extraOptions);
    console.log("Refresh result:", refreshResult);
    
    if (refreshResult?.data) {
      console.log("Refresh successful, updating credentials");
      const user = api.getState().auth.user;
      
      // Update the auth state with new tokens
      await api.dispatch(setCredentials({ 
        data: {
          ...refreshResult.data,
          user: user || refreshResult.data.user
        }
      }));
      
      // Retry the original request
      console.log("Retrying original request with new token");
      result = await baseQuery(args, api, extraOptions);
    } else {
      console.log("Refresh failed, logging out");
      await api.dispatch(logOut());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 5,
  refetchOnMountOrArgChange: 5,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({}),
});
