import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { BroadcastPage } from "./pages/BroadcastPage";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;