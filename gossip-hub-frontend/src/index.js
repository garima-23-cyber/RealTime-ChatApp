// 1. Unified Polyfills (MUST BE AT THE VERY TOP)
import { Buffer } from 'buffer/';
import process from 'process';

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
  // Ensure basic process properties exist
  window.process.env = window.process.env || {};
  window.process.env.NODE_ENV = window.process.env.NODE_ENV || 'production';
}

// 2. Standard React Imports
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 3. Provider Imports
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);