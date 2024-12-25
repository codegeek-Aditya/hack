import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import userReducer from "./features/user/userSlice";
import { UserType } from "~/lib/types";

export interface RootState {
  user: {
    currentUser: UserType | null;
    accessToken: string | null;
    refreshToken: string | null;
  };
}

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
