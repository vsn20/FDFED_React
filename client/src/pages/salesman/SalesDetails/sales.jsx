import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SalesList from './SalesList';
import AddSale from './AddSale';
import SaleDetails from './SaleDetails'; 
import styles from './Sales.module.css'; 

const Sales = () => {
  return (
    <div className={styles.container}>
      <div className={styles.contentArea}>
        <Routes>
          <Route index element={<SalesList />} /> 
          
          <Route path="add" element={<AddSale />} />
          
          <Route path=":sales_id" element={<SaleDetails />} />
        </Routes>
      </div>
    </div>
  );
};

export default Sales;