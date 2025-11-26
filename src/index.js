import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './devextreme-license';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    /*<BrowserRouter basename='/portal_contratos/'>*/
    /*<BrowserRouter basename='/contratosccq/'>*/
    <BrowserRouter basename='/contratosccq/'>
      <App />
    </BrowserRouter>
);
