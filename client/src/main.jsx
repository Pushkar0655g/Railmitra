import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';

import './index.css';

import { io } from 'socket.io-client';

import { AuthProvider } from './context/AuthContext';

import { ThemeProvider } from './context/ThemeContext';

import { LanguageProvider } from './context/LanguageContext';

import ToastProvider from './components/Toast';

import { API_URL } from './api/axios';

const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

window.socket = io(
  SOCKET_URL,
  {
    transports: ['websocket', 'polling']
  }
);


ReactDOM.createRoot(
  document.getElementById('root')
).render(

  <React.StrictMode>

    <ThemeProvider>

      <LanguageProvider>

        <AuthProvider>

          <ToastProvider />

          <App />

        </AuthProvider>

      </LanguageProvider>

    </ThemeProvider>

  </React.StrictMode>

);