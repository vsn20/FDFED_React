import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// 1. Async Thunks

// Fetch All Employees
export const fetchEmployees = createAsyncThunk('employees/fetchAll', async () => {
    const response = await api.get('/employees');
    return response.data;
});

// Add Employee
export const createEmployee = createAsyncThunk('employees/add', async (employeeData, { rejectWithValue }) => {
    try {
        const response = await api.post('/employees', employeeData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Error adding employee');
    }
});

// Update Employee
export const updateEmployee = createAsyncThunk('employees/update', async ({ e_id, employeeData }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/employees/${e_id}`, employeeData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Error updating employee');
    }
});

// 2. Slice
const employeeSlice = createSlice({
    name: 'employees',
    initialState: {
        items: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchEmployees.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            // Add
            .addCase(createEmployee.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            // Update
            .addCase(updateEmployee.fulfilled, (state, action) => {
                const index = state.items.findIndex(emp => emp.e_id === action.payload.e_id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            });
    }
});

export default employeeSlice.reducer;