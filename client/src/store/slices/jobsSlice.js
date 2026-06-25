import { createSlice } from '@reduxjs/toolkit';

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { list: [], current: null, loading: false, error: null, pagination: null },
  reducers: {
    setJobs: (state, action) => { state.list = action.payload.jobs; state.pagination = action.payload.pagination; },
    setCurrentJob: (state, action) => { state.current = action.payload; },
    addJob: (state, action) => { state.list.unshift(action.payload); },
    removeJob: (state, action) => { state.list = state.list.filter((j) => j._id !== action.payload); },
    setLoading: (state, action) => { state.loading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setJobs, setCurrentJob, addJob, removeJob, setLoading, setError } = jobsSlice.actions;
export default jobsSlice.reducer;
