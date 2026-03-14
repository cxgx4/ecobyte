import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import AuraPath from "./pages/AuraPath";
import AlertSettings from "./pages/AlertSettings";
import SystemStatus from "./pages/SystemStatus";

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aurapath" element={<AuraPath />} />
          <Route path="/alerts" element={<AlertSettings />} />
          <Route path="/system" element={<SystemStatus />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;