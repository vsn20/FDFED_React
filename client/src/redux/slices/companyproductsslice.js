// client/src/redux/slices/companyProductSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api'; 

// --- Thunks (Async Actions) ---

// 1. Fetch All Products
export const fetchCompanyProducts = createAsyncThunk(
  'companyProducts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/company/products');
      return response.data.products || response.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 2. Add New Product (Updated for File Upload)
export const addCompanyProduct = createAsyncThunk(
  'companyProducts/add',
  async (productFormData, { rejectWithValue }) => {
    try {
      // FIX: Explicitly set the header to multipart/form-data
      const response = await api.post('/company/products/add', productFormData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 3. Fetch Product Details
export const fetchCompanyProductDetails = createAsyncThunk(
  'companyProducts/fetchDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/company/products/details/${productId}`);
      return response.data.product || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 4. Update Stock Availability
export const updateStockAvailability = createAsyncThunk(
  'companyProducts/updateStock',
  async ({ productId, stockavailability }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/company/products/update-stockavailability/${productId}`, {
        stockavailability
      });
      return { productId, stockavailability, success: response.data.success };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// --- Slice ---
const companyProductSlice = createSlice({
  name: 'companyProducts',
  initialState: {
    items: [],
    currentProduct: null, 
    status: 'idle',       
    actionStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    actionError: null
  },
  reducers: {
    resetActionStatus: (state) => {
      state.actionStatus = 'idle';
      state.actionError = null;
    },
    clearCurrentProduct: (state) => {
        state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchCompanyProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCompanyProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCompanyProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Add Product
      .addCase(addCompanyProduct.pending, (state) => {
        state.actionStatus = 'loading';
        state.actionError = null;
      })
      .addCase(addCompanyProduct.fulfilled, (state) => {
        state.actionStatus = 'succeeded';
      })
      .addCase(addCompanyProduct.rejected, (state, action) => {
        state.actionStatus = 'failed';
        state.actionError = action.payload || action.error.message;
      })

      // Fetch Details
      .addCase(fetchCompanyProductDetails.pending, (state) => {
        state.status = 'loading';
        state.currentProduct = null;
        state.error = null;
      })
      .addCase(fetchCompanyProductDetails.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProduct = action.payload;
      })
      .addCase(fetchCompanyProductDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Update Stock
      .addCase(updateStockAvailability.fulfilled, (state, action) => {
        const listIndex = state.items.findIndex(p => p.prod_id === action.payload.productId);
        if (listIndex !== -1) {
          state.items[listIndex].stockavailability = action.payload.stockavailability;
        }
        if (state.currentProduct && state.currentProduct.prod_id === action.payload.productId) {
            state.currentProduct.stockavailability = action.payload.stockavailability;
        }
      });
  }
});

export const { resetActionStatus, clearCurrentProduct } = companyProductSlice.actions;
export default companyProductSlice.reducer;