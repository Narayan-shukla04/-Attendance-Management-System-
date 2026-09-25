import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../config/AxiosInstance";

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/users/me");
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Not authenticated");
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout");
      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  }
);

const AuthSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true, 
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { setUser, clearUser } = AuthSlice.actions;
export default AuthSlice.reducer;