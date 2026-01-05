import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./authApi";

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.me.matchRejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
