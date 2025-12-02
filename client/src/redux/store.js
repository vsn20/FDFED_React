import { configureStore } from '@reduxjs/toolkit';
import branchReducer from './slices/branchSlice';
import employeeReducer from './slices/employeeSlice';
import saleReducer from './slices/saleSlice';
import managerEmployeeReducer from './slices/managerEmployeeSlice';

const store = configureStore({
    reducer: {
        branches: branchReducer,
        employees: employeeReducer,
        sales: saleReducer,
        managerEmployees: managerEmployeeReducer,
    },
});

export default store;