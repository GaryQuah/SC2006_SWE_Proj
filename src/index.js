import React from 'react';
import './index.css';
import App from './App';
import { createRoot } from 'react-dom/client'; // Use createRoot instead of ReactDOM.render

const rootElement = document.getElementById('root');
const root = createRoot(rootElement); // Create a root.

root.render(<App />); // Use the new render method.

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
