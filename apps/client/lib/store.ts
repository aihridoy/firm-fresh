import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";

export const makeStore = () => {
  return configureStore({
    reducer: {},
  });
};

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
