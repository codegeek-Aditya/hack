import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserType } from "~/lib/types";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

interface UserState {
  currentUser: UserType | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: UserState = {
  currentUser: null,
  accessToken: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserType>) => {
      state.currentUser = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.accessToken = null;
      state.refreshToken = null;
    },
  },
});

const persistConfig = {
  key: "user",
  storage,
  whitelist: ["currentUser", "accessToken", "refreshToken"],
};

export const { setUser, setTokens, clearUser } = userSlice.actions;
export default persistReducer(persistConfig, userSlice.reducer);
export type UserStateType = ReturnType<typeof userSlice.reducer>;
