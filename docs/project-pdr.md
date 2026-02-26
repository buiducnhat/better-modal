# Project PDR — better-modal

## Product Overview

**better-modal** is a lightweight React library that manages modal open/close state declaratively through a global Zustand store. It allows developers to open modals imperatively from anywhere in the component tree — including outside of React components — and await their results as Promises.

## Problem Statement

Managing modal state in React apps is typically messy: state is scattered across components, passing callbacks between deeply nested components is cumbersome, and awaiting a modal's result (e.g., a confirmation dialog) requires ad-hoc workarounds. better-modal solves this by centralising all modal state in a Zustand store and exposing a clean, Promise-based API.

## Target Users

React application developers who want a simple, powerful, and type-safe solution for managing modals — without coupling UI components tightly to state management boilerplate.

## Core Features

| Feature               | Description                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `createModal`         | Registers a modal component with an ID and returns a typed `show` / `hide` API usable anywhere                    |
| `useModal`            | React hook that gives a component access to its own modal state (`visible`, `props`, `resolve`, `reject`, `hide`) |
| `ModalContainer`      | Drop-in component placed once at the app root; renders all registered modals                                      |
| `registerModal`       | Lower-level function to register a component in the global modal registry                                         |
| Promise-based results | `show()` returns a Promise that resolves/rejects when the modal calls `resolve()` / `reject()`                    |
| Selective re-renders  | Each modal component only re-renders when its own state changes (Zustand slice subscription)                      |

## Success Criteria

- Developers can register a modal in a single `createModal()` call
- Modals can be opened from anywhere — inside or outside React components — via `Modal.show(props)`
- The result of a modal interaction is awaitable: `const result = await Modal.show({ ... })`
- TypeScript provides full type inference on modal props and resolved values
- Zero runtime peer dependency beyond React and Zustand

## Non-Goals (MVP)

- No built-in UI styling or component library integration (headless/UI-agnostic)
- No animation support in the core library
- No demo app or documentation website in the initial release

## Roadmap

No strict versioned roadmap. Development is iterative — features are added as needs arise.

**Planned improvements (backlog):**

- TypeScript generics: typed `resolve` / `reject` values per modal
- `useModalStore` escape hatch exposure for advanced use-cases
- Optional animation lifecycle hooks (`onOpen`, `onClose`, `afterClose`)
- Support for stacking / layering multiple instances of the same modal
- Example app or Storybook integration

## Publishing

Package name: `@buiducnhat/better-modal`
Registry: npm
Entry point: `./src/index.ts` (dev) / `./dist` (built)
Peer dependencies: `react ^19`, `zustand ^5`, `typescript catalog:`
