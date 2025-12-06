import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { BroadcastPage } from "./pages/BroadcastPage";

// Use root basename since app is deployed on subdomain (bubbles.nelsonoliveira.com)
const basename = "/";

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