import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import userReducer from "./api/endpoints/userSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {},
  });
};

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
