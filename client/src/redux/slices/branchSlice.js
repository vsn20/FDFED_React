// client/src/redux/slices/branchSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api' // Adjust path to your api instance

// 1. Thunks (Async Actions)

// Fetch All Branches
export const fetchBranches = createAsyncThunk('branches/fetchAll', async () => {
    const response = await api.get('/branches');
    return response.data;
});

// Add Branch
export const createBranch = createAsyncThunk('branches/add', async (branchData) => {
    const response = await api.post('/branches', branchData);
    return response.data;
});

// Update Branch
export const updateBranch = createAsyncThunk('branches/update', async ({ bid, branchData }) => {
    const response = await api.put(`/branches/${bid}`, branchData);
    return response.data;
});

// 2. Slice
const branchSlice = createSlice({
    name: 'branches',
    initialState: {
        items: [],
        status: 'idle', 
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Cases
            .addCase(fetchBranches.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBranches.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchBranches.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Add Case
            .addCase(createBranch.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update Case
            .addCase(updateBranch.fulfilled, (state, action) => {
                const index = state.items.findIndex(branch => branch.bid === action.payload.bid);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    }
});

export default branchSlice.reducer;