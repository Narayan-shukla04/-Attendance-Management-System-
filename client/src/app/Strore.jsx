import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../feature/AuthSlice";

const Store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
export default Store;