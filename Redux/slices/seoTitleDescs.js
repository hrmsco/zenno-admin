// ** Third Party Imports
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  seoTitleDescs: [],
};

const seoTitleDescs = createSlice({
  name: "seoTitleDescs",
  initialState,
  reducers: {
    getSeoTitleDescs: (state, action) => {
      state.seoTitleDescs = action.payload;
    },
    addSeoTitleDesc: (state, action) => {
      state.seoTitleDescs.push(action.payload);
    },
    editSeoTitleDesc: (state, action) => {
      state.seoTitleDescs = state.seoTitleDescs.map((page) =>
        page._id === action.payload._id ? action.payload : page
      );
    },
    removeSeoTitleDesc: (state, action) => {
      state.seoTitleDescs.splice(
        state.seoTitleDescs.findIndex((item) => item._id === action.payload),
        1
      );
    },
  },
});

export const {
  getSeoTitleDescs,
  addSeoTitleDesc,
  editSeoTitleDesc,
  removeSeoTitleDesc,
} = seoTitleDescs.actions;

export default seoTitleDescs.reducer;
