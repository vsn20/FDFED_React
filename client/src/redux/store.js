import { configureStore } from '@reduxjs/toolkit';
import branchReducer from './slices/branchSlice';
import employeeReducer from './slices/employeeSlice';
import saleReducer from './slices/saleSlice'; 
import salesmanSalesReducer from './slices/salesmanSalesSlice';

const store = configureStore({
    reducer: {
        branches: branchReducer,
        employees: employeeReducer,
        sales: saleReducer, 
        salesmanSales: salesmanSalesReducer, 
    },
});

export default store;