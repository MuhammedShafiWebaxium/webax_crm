import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  companies: null,
  users: null,
};

export const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompanies: (state) => {
      state.companies = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
  },
});

export const { setCompanies, setUsers } = companySlice.actions;

export default companySlice.reducer;
