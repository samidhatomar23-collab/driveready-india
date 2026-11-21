import '@fontsource-variable/noto-sans-devanagari/wght.css';
import '@fontsource-variable/noto-sans-telugu/wght.css';
import '@fontsource-variable/noto-sans-tamil/wght.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import './index.css';

registerSW({ immediate: true });
createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>
);
