import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// Async Thunk to fetch all sales
export const fetchSales = createAsyncThunk('sales/fetchAll', async () => {
    const response = await api.get('/owner/sales');
    return response.data;
});

const saleSlice = createSlice({
    name: 'sales',
    initialState: {
        items: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSales.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSales.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchSales.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export default saleSlice.reducer;