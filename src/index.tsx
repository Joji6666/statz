import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import DebugPanel from "./DebugPanel";

// Global state, listeners, and computed states storage declaration
type StateMap = Record<string, any>;
const stateMap: StateMap = {};
const listeners: Record<string, Set<Function>> = {};
const computedStates: Record<string, () => any> = {};
const computedDependencies: Record<string, Set<string>> = {}; // Maps state keys to computed state keys
let debugLogs: {
  key: string;
  prevValue: any;
  newValue: any;
  source?: string;
}[] = []; // Stores debug logs
let isDebugPanelVisible = false;
let root: ReactDOM.Root | null = null;

// Helper function to capture caller info from stack trace
function getCallerInfo() {
  const stack = new Error().stack;
  if (!stack) return "unknown source";

  const stackLines = stack.split("\n");
  const callerLine = stackLines[3];
  const callerInfo = callerLine?.trim().match(/at (.+)/);
  return callerInfo ? callerInfo[1] : "unknown source";
}

// 1. Function to initialize a state
export function initializeState<T>(key: string, initialValue: T): void {
  if (!(key in stateMap)) {
    stateMap[key] = initialValue;
    listeners[key] = new Set();
  }
}

// Reactive getState with subscription
export function useReactiveState(key) {
  const [state, setState] = useState(() => getState(key));

  useEffect(() => {
    const updateState = (newState) => setState(newState);
    listeners[key].add(updateState);

    return () => {
      listeners[key].delete(updateState);
    };
  }, [key]);

  return state;
}

// 2. Function to retrieve the value of a state
export function getState<T>(key: string): T {
  if (!(key in stateMap)) {
    throw new Error(`State with key "${key}" does not exist.`);
  }
  return stateMap[key];
}

// 3. Function to set the value of a state (updates only related computed states)
// Enhanced setState to support function-based updates with auto caller info
export function setState(key, newValue) {
  const prevValue = stateMap[key];
  const resolvedValue =
    typeof newValue === "function" ? newValue(prevValue) : newValue;

  if (prevValue === resolvedValue) return;

  stateMap[key] = resolvedValue;
  const callerInfo = getCallerInfo();
  logDebug(key, prevValue, resolvedValue, callerInfo);

  if (listeners[key]) {
    listeners[key].forEach((listener) => listener(resolvedValue));
  }

  // Update only related computed states when a state changes
  updateComputedStates(key);
}

// 4. Function for asynchronous state management
export async function setAsyncState<T>(
  key: string,
  asyncFn: () => Promise<T>
): Promise<void> {
  try {
    const result = await asyncFn();
    setState(key, result);
  } catch (error) {
    console.error("Error updating async state:", error);
  }
}

// 5. Function to subscribe to a state and listen for changes
export function subscribe<T>(
  key: string,
  callback: (value: T) => void
): () => void {
  if (!(key in listeners)) {
    throw new Error(`State with key "${key}" does not exist.`);
  }

  listeners[key].add(callback);
  return () => {
    listeners[key].delete(callback);
  };
}

// 6. Function to set a computed (derived) state with dependencies
export function computed<T>(
  key: string,
  computeFn: () => T,
  dependencies: string[]
): void {
  computedStates[key] = computeFn;
  stateMap[key] = computeFn();

  // Register dependencies for computed state
  dependencies.forEach((depKey) => {
    if (!computedDependencies[depKey]) computedDependencies[depKey] = new Set();
    computedDependencies[depKey].add(key);
  });
}

// 7. Function to update specific computed states based on the changed key
function updateComputedStates(changedKey) {
  const relatedComputedKeys = computedDependencies[changedKey];
  if (!relatedComputedKeys) return;

  relatedComputedKeys.forEach((computedKey) => {
    const computeFn = computedStates[computedKey];
    if (!computeFn) return;

    const prevValue = stateMap[computedKey];
    const newValue = computeFn();

    if (prevValue !== newValue) {
      stateMap[computedKey] = newValue;
      listeners[computedKey]?.forEach((listener) => listener(newValue));
      logDebug(computedKey, prevValue, newValue, "computed state");
    }
  });
}

// 8. React hook to access global state in components
export function useGlobalState<T>(key: string): [T, (newValue: T) => void] {
  const [localState, setLocalState] = useState(() => getState<T>(key));
  const setGlobalState = (newValue) => setState(key, newValue);

  useEffect(() => {
    const updateState = (newState) => setLocalState(newState);
    if (!listeners[key]) listeners[key] = new Set();
    listeners[key].add(updateState);

    return () => {
      listeners[key].delete(updateState);
    };
  }, [key]);

  return [localState, setGlobalState];
}

// 9. Function to create and manage global state
export function createGlobalState<T>(key: string, initialValue: T) {
  initializeState(key, initialValue);
  return {
    getState: () => getState<T>(key),
    setState: (value: T) => setState(key, value),
    setAsyncState: (asyncFn: () => Promise<T>) => setAsyncState(key, asyncFn),
    useState: () => useGlobalState<T>(key),
    computed: (computeFn: () => T, dependencies: string[]) =>
      computed(key, computeFn, dependencies)
  };
}

// 10. Debug panel function to log state changes
function logDebug(
  key: string,
  prevValue: any,
  newValue: any,
  source?: string
): void {
  debugLogs.push({ key, prevValue, newValue, source });
  renderDebugPanel();
}

// Function to toggle the visibility of the debug panel
export function toggleDebugPanel(): void {
  isDebugPanelVisible = !isDebugPanelVisible;
  renderDebugPanel();
}

// Function to render the debug panel to the DOM
function renderDebugPanel(): void {
  const debugRoot = document.getElementById("debug-root") || createDebugRoot();

  if (!root) {
    root = ReactDOM.createRoot(debugRoot);
  }

  if (isDebugPanelVisible) {
    root.render(<DebugPanel logs={debugLogs} />);
  } else {
    root.unmount();
  }
}

// Function to create the root element for the debug panel if it doesn't exist
function createDebugRoot() {
  const debugRoot = document.createElement("div");
  debugRoot.id = "debug-root";
  document.body.appendChild(debugRoot);
  return debugRoot;
}
