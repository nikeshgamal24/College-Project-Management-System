import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null },
  reducers: {
    setCredentials: (state, action) => {
      const { data } = action.payload;
      
      // Add debugging to see what's coming in
      console.log("setCredentials payload:", action.payload);
      
      // Handle both direct data and nested data structures
      if (data?.data?.user && data?.data?.accessToken) {
        state.user = data.data.user;
        state.token = data.data.accessToken;
      } else if (data?.user && data?.accessToken) {
        state.user = data.user;
        state.token = data.accessToken;
      } else if (action.payload?.user && action.payload?.accessToken) {
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      }
      
      console.log("Updated state.user:", state.user);
      console.log("Updated state.token:", state.token);
    },
    setUser: (state, action) => {
      const { user } = action.payload;
      state.user = user.user;
    },
    updateUserPhoto: (state, action) => {
      const { photo } = action.payload;
      if (state.user) {
        state.user.photo = photo;
      }
    },
    updateUserProfile: (state, action) => {
      const { fullname, phoneNumber, program, rollNumber, batchNumber } = action.payload;
      if (state.user) {
        if (fullname) state.user.fullname = fullname;
        if (phoneNumber) state.user.phoneNumber = phoneNumber;
        if (program) state.user.program = program;
        if (rollNumber) state.user.rollNumber = rollNumber;
        if (batchNumber) state.user.batchNumber = batchNumber;
      }
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logOut, setUser, updateUserPhoto, updateUserProfile } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth?.user;

export const selectCurrentToken = (state) => state.auth?.token;
