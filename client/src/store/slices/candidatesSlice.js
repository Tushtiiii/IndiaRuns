import { createSlice } from '@reduxjs/toolkit';

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState: { ranked: [], selected: [], profile: null, loading: false },
  reducers: {
    setRanked: (state, action) => { state.ranked = action.payload; },
    setProfile: (state, action) => { state.profile = action.payload; },
    toggleSelect: (state, action) => {
      const id = action.payload;
      if (state.selected.includes(id)) {
        state.selected = state.selected.filter((s) => s !== id);
      } else if (state.selected.length < 3) {
        state.selected.push(id);
      }
    },
    clearSelected: (state) => { state.selected = []; },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

export const { setRanked, setProfile, toggleSelect, clearSelected, setLoading } = candidatesSlice.actions;
export default candidatesSlice.reducer;
