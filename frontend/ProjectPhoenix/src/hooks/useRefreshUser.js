import { setCredentials, setUser } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { authApiSlice } from "@/features/auth/authApiSlice";

const useRefreshUser = () => {
  const dispatch = useDispatch();

  const refreshUser = async () => {
    try {
      const result = await dispatch(
        authApiSlice.endpoints.refreshUser.initiate(undefined, {
          forceRefetch: true,
        })
      );
      
      console.log("refreshUser result:", result);
      
      if (result.data) {
        dispatch(setUser({ user: result.data }));
      }
    } catch (error) {
      console.log("refreshUser error:", error);
    }
  };
  return refreshUser;
};

export default useRefreshUser;
