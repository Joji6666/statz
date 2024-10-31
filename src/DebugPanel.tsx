import React, { ReactNode } from "react";

interface DebugLog {
  key: string;
  prevValue: any;
  newValue: any;
}

const DebugPanel = ({ logs }: { logs: DebugLog[] }): ReactNode => (
  <div style={panelStyle}>
    <h3>Debug Panel</h3>
    <ul style={listStyle}>
      {logs.map((log, index) => (
        <li key={index}>
          <strong>{log.key}</strong>: {JSON.stringify(log.newValue)}
        </li>
      ))}
    </ul>
  </div>
);

const panelStyle = {
  position: "fixed" as "fixed",
  bottom: "0",
  right: "0",
  width: "300px",
  height: "400px",
  backgroundColor: "rgba(0,0,0,0.8)",
  color: "white",
  overflowY: "scroll" as "scroll",
  padding: "10px",
  fontSize: "14px",
  zIndex: 9999
};

const listStyle = {
  listStyle: "none",
  padding: "0"
};

export default DebugPanel;
