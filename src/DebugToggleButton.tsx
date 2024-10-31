import React from "react";
import { toggleDebugPanel } from ".";

const DebugToggleButton: React.FC = () => (
  <button
    onClick={toggleDebugPanel}
    style={{
      position: "fixed",
      bottom: "420px",
      right: "10px",
      zIndex: 10000
    }}
  >
    Toggle Debug Panel
  </button>
);

export default DebugToggleButton;
