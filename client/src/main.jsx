import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import CarsPage from "./CarsPage"; 

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/cars" element={<CarsPage />} /> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

{/*
  ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
  */}

