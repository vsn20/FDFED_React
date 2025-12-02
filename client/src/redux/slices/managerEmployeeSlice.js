import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // List of all employees fetched for the manager's branch
    list: [],
    currentEmployee: null,
    loading: false,
    error: null,
};

const managerEmployeeSlice = createSlice({
    name: 'managerEmployees',
    initialState,
    reducers: {
        // Fetches the list of employees
        fetchEmployeesStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchEmployeesSuccess: (state, action) => {
            state.loading = false;
            state.list = action.payload;
        },
        fetchEmployeesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Fetches a single employee's details
        fetchEmployeeDetailsSuccess: (state, action) => {
            state.currentEmployee = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchEmployeeDetailsFailure: (state, action) => {
            state.currentEmployee = null;
            state.loading = false;
            state.error = action.payload;
        },
        // Used to update the list immediately after adding a new employee
        addEmployeeSuccess: (state, action) => {
            state.list.push(action.payload); // Add the new employee to the list
        },
        // Used to update an employee's details in the list and currentEmployee view
        updateEmployeeSuccess: (state, action) => {
            const updatedEmployee = action.payload;
            // Update the employee in the list
            state.list = state.list.map(emp =>
                emp.e_id === updatedEmployee.e_id ? updatedEmployee : emp
            );
            // Update current employee if it's the one being viewed
            if (state.currentEmployee && state.currentEmployee.e_id === updatedEmployee.e_id) {
                state.currentEmployee = updatedEmployee;
            }
        },
        clearCurrentEmployee: (state) => {
            state.currentEmployee = null;
            state.error = null;
        }
    },
});

export const {
    fetchEmployeesStart,
    fetchEmployeesSuccess,
    fetchEmployeesFailure,
    fetchEmployeeDetailsSuccess,
    fetchEmployeeDetailsFailure,
    addEmployeeSuccess,
    updateEmployeeSuccess,
    clearCurrentEmployee
} = managerEmployeeSlice.actions;

export default managerEmployeeSlice.reducer;