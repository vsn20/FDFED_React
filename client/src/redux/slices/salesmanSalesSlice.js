import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

// 1. Async Thunks

// Fetch All Sales
export const fetchSales = createAsyncThunk('salesmanSales/fetchAll', async () => {
    const response = await api.get('/salesman/sales');
    return response.data;
});

// Fetch Single Sale Details
export const fetchSaleDetails = createAsyncThunk('salesmanSales/fetchOne', async (id, { rejectWithValue }) => {
    try {
        const response = await api.get(`/salesman/sales/${id}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Error fetching sale details');
    }
});

// Add Sale
export const createSale = createAsyncThunk('salesmanSales/add', async (saleData, { rejectWithValue }) => {
    try {
        const response = await api.post('/salesman/sales', saleData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Error adding sale');
    }
});

export const initiateScannerPayment = createAsyncThunk('salesmanSales/initiateScannerPayment', async (saleData, { rejectWithValue }) => {
    try {
        const response = await api.post('/salesman/sales/payments/initiate-scanner', saleData);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Error initiating scanner payment');
    }
});

export const fetchScannerPaymentStatus = createAsyncThunk('salesmanSales/fetchScannerPaymentStatus', async (paymentReferenceId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/salesman/sales/payments/status/${paymentReferenceId}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Error fetching scanner payment status');
    }
});


export const fetchCompanies = createAsyncThunk('salesmanSales/fetchCompanies', async () => {
    const response = await api.get('/salesman/sales/helpers/companies');
    return response.data;
});

export const fetchProductsByCompany = createAsyncThunk('salesmanSales/fetchProducts', async (companyId) => {
    const response = await api.get(`/salesman/sales/helpers/products-by-company/${companyId}`);
    return response.data;
});

// 2. Slice
const salesmanSalesSlice = createSlice({
    name: 'salesmanSales',
    initialState: {
        items: [],    
        currentItem: null, 
        companies: [],
        products: [],
        status: 'idle',    
        error: null,
        success: false,
        scannerPayment: null,
        scannerPaymentStatus: 'idle'
    },
    reducers: {
        resetStatus: (state) => {
            state.status = 'idle';
            state.error = null;
            state.success = false;
            state.currentItem = null;
        },
        clearProducts: (state) => {
            state.products = [];
        },
        clearScannerPayment: (state) => {
            state.scannerPayment = null;
            state.scannerPaymentStatus = 'idle';
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
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
            })

            // Fetch One
            .addCase(fetchSaleDetails.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSaleDetails.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentItem = action.payload;
            })
            .addCase(fetchSaleDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Add Sale
            .addCase(createSale.pending, (state) => {
                state.status = 'loading';
                state.success = false;
            })
            .addCase(createSale.fulfilled, (state) => {
                state.status = 'succeeded';
                state.success = true;
            })
            .addCase(createSale.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.success = false;
            })

            // Helpers
            .addCase(fetchCompanies.fulfilled, (state, action) => {
                state.companies = action.payload;
            })
            .addCase(fetchProductsByCompany.fulfilled, (state, action) => {
                state.products = action.payload;
            })

            // Scanner payment init
            .addCase(initiateScannerPayment.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(initiateScannerPayment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.scannerPayment = action.payload;
                state.scannerPaymentStatus = action.payload.payment_status || 'pending';
            })
            .addCase(initiateScannerPayment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })

            // Scanner payment status
            .addCase(fetchScannerPaymentStatus.pending, (state) => {
                state.scannerPaymentStatus = 'checking';
            })
            .addCase(fetchScannerPaymentStatus.fulfilled, (state, action) => {
                state.scannerPaymentStatus = action.payload.payment_status || 'pending';
                if (state.scannerPayment) {
                    state.scannerPayment = {
                        ...state.scannerPayment,
                        ...action.payload
                    };
                }
            })
            .addCase(fetchScannerPaymentStatus.rejected, (state, action) => {
                state.scannerPaymentStatus = 'failed';
                state.error = action.payload;
            });
    }
});

export const { resetStatus, clearProducts, clearScannerPayment } = salesmanSalesSlice.actions;
export default salesmanSalesSlice.reducer;