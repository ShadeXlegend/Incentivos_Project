import React from 'react';
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { SnackbarProvider } from "notistack";
import App from './App';
import { AuthProvider, LayoutProvider } from "./states";

ReactDOM.createRoot(document.getElementById("root")).render(<StrictMode>
  <HelmetProvider>
    <AuthProvider>
      <LayoutProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </LayoutProvider>
    </AuthProvider>
  </HelmetProvider>
</StrictMode>
);