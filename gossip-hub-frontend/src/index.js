import "./polyfilled";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 3. Provider Imports
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ContactProvider } from "./context/ContactContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ContactProvider>
        <SocketProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
      </SocketProvider>
      </ContactProvider>
    </AuthProvider>
  </React.StrictMode>
);