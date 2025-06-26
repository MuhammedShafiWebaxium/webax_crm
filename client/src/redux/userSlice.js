import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: null,
  error: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.error = false;
    },
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = false;
    },
    loginFailure: (state) => {
      state.error = true;
    },
    logOut: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = false;
    },
  },
});

export const { loginStart, setUser, loginFailure, logOut } = userSlice.actions;

export default userSlice.reducer;
