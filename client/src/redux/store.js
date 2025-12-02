import { configureStore } from '@reduxjs/toolkit';
import branchReducer from './slices/branchSlice';
import employeeReducer from './slices/employeeSlice';
import saleReducer from './slices/saleSlice'; // Import sales reducer

const store = configureStore({
    reducer: {
        branches: branchReducer,
        employees: employeeReducer,
        sales: saleReducer,
    },
});

export default store;