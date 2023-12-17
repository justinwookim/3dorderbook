import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ThreeScene from './ThreeScene'; // Import the new component

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThreeScene />
  </React.StrictMode>
);

