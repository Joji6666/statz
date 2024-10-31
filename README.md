# Custom Global State Management Library

A simple yet flexible library to manage global and computed states with React. This library allows you to create and use global state variables, manage computed (derived) states based on dependencies, and offers a debugging panel to track state changes.

## Features

- **Global State Management**: Create global states that can be shared across components.
- **Computed (Derived) States**: Create computed states that automatically update when dependent states change.
- **Debug Panel**: Track state changes, showing previous and new values for debugging purposes.

## Installation

Copy the code directly into your project or create a module from it.

## Usage

### 1. Initialize a Global State

To start using a global state, first initialize it with a key and an initial value.

```javascript
import { createGlobalState } from "./path-to-your-library";

const counterState = createGlobalState("counter", 0);
```

### 2. Access and Update Global State

Use the state with useState hook from the createGlobalState function, which will provide the current state and an updater function similar to React’s useState.

```javascript
import React from "react";
const CounterComponent = () => {
  const [counter, setCounter] = counterState.useState();

  return (
    <div>
      <p>Counter: {counter}</p>
      <button onClick={() => setCounter(counter + 1)}>Increment</button>
    </div>
  );
};
```

### 3. Computed States

Define computed states with dependencies. Computed states will automatically update when one or more of their dependencies change.

```javascript
const doubleCounterState = counterState.computed(
  () => counterState.getState() * 2,
  ["counter"]
);
```

To use the computed state in a component:

```javascript
const DoubleCounterComponent = () => {
  const doubleCounter = doubleCounterState.useState();

  return <p>Double Counter: {doubleCounter}</p>;
};
```

### 4. Debug Panel

Toggle the debug panel to view all state changes and their sources. It shows the previous and new values each time a state changes.

```javascript
import { toggleDebugPanel } from "./path-to-your-library";

// Call this function to show or hide the debug panel
toggleDebugPanel();
```

## API Reference

# `createGlobalState<T>(key: string, initialValue: T)`

- `key` (string): Unique identifier for the state.
- `initialValue` (T): Initial value of the state.

Returns

- Object with the following methods
- `getState()`: Returns the current state value.
- `setState(value: T)`: Sets the state to a new value.
- `setAsyncState(asyncFn: () => Promise<T>)`: Sets the state asynchronously.
- `useState()`: Hook to access the state in components.
- `computed(computeFn: () => T, dependencies: string[])`: Creates a computed state based on dependencies.

# `useGlobalState(key: string)`

`useGlobalState` can be used directly to subscribe to any global state by key. It returns an array with two values:

- Current State: The current value of the specified global state.
- State Setter Function: Function to update the global state, which accepts a new value or a function to update based on the previous value.

```javascript
import React from "react";

const CounterComponent = () => {
  const [counter, setCounter] = counterState.useState();

  return (
    <div>
      <p>Counter: {counter}</p>
      <button onClick={() => setCounter((prev) => prev + 1)}>Increment</button>
      <button onClick={() => setCounter((prev) => prev - 1)}>Decrement</button>
    </div>
  );
};
```
