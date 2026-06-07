import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LanguageProvider } from './context/LanguageContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider>
      <LanguageProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </LanguageProvider>
    </ThemeProvider>
  </Provider>
);
