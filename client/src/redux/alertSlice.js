import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  type: null,
  message: '',
  visible: false,
};

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    showAlert: (state, action) => {
      state.type = action.payload.type;
      state.message = action.payload.message;
      state.visible = true;
    },
    hideAlert: (state) => {
      state.type = null;
      state.message = '';
      state.visible = false;
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;

export default alertSlice.reducer;
