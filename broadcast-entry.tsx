import React from "react";
import { createRoot } from "react-dom/client";
import { BroadcastPage } from "./pages/BroadcastPage";

// Standalone entry point for broadcast.html
// This bypasses React Router for direct access to the broadcast page

const BroadcastApp: React.FC = () => {
  return <BroadcastPage />;
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<BroadcastApp />);
}
