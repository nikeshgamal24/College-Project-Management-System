import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null },
  reducers: {
    setCredentials: (state, action) => {
      const { data } = action.payload;
      
      // Add debugging to see what's coming in
      console.log("setCredentials payload:", action.payload);
      console.log("setCredentials data:", data);
      
      // Handle both direct data and nested data structures
      if (data?.data?.user && data?.data?.accessToken) {
        console.log("Using nested data structure");
        state.user = data.data.user;
        state.token = data.data.accessToken;
      } else if (data?.user && data?.accessToken) {
        console.log("Using direct data structure");
        state.user = data.user;
        state.token = data.accessToken;
      } else if (action.payload?.user && action.payload?.accessToken) {
        console.log("Using payload structure");
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      } else {
        console.log("No matching data structure found");
        console.log("Available keys in data:", data ? Object.keys(data) : "data is null/undefined");
        console.log("Available keys in payload:", Object.keys(action.payload));
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
      const { 
        fullname, 
        email, 
        phoneNumber, 
        designation, 
        institution, 
        skillSet, 
        photo,
        program, 
        rollNumber, 
        batchNumber 
      } = action.payload;
      
      if (state.user) {
        if (fullname) state.user.fullname = fullname;
        if (email) state.user.email = email;
        if (phoneNumber) state.user.phoneNumber = phoneNumber;
        if (designation) state.user.designation = designation;
        if (institution) state.user.institution = institution;
        if (skillSet) state.user.skillSet = skillSet;
        if (photo) state.user.photo = photo;
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
