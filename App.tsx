import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { BroadcastPage } from "./pages/BroadcastPage";
import { LandingPage } from "./pages/LandingPage";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/broadcast" element={<BroadcastPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;