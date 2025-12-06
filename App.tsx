import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { BroadcastPage } from "./pages/BroadcastPage";

// Determine basename based on environment
// In production with Traefik strip-prefix, we need /bubbles
// Traefik strips /bubbles but the browser URL still has it
const basename = "/bubbles";

const App: React.FC = () => {
  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
        {/* Default to admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;