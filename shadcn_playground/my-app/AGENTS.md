# default from shadCN 
-  rec not to use (for now) since its calling npm which we dont use 


# Agent Guidelines

This document outlines the commands, code style, and conventions for agents operating within this repository.

## Build, Lint, and Test Commands

- **Build:** `npm run build`
- **Lint:** `npm run lint` (runs Prettier and ESLint)
- **Test All:** `npm run test`
- **Unit Tests:** `npm run test:unit`
- **Single Test (Client):** `vitest -p client <path/to/test.spec.ts>`
- **Single Test (Server):** `vitest -p server <path/to/test.spec.ts>`

## Code Style Guidelines

- **Formatting:** Prettier (with `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`). Run with `npm run format`.
- **Linting:** ESLint (configured via `eslint.config.js`, extends recommended rules for JS, TS, Svelte, and Prettier). Run with `npm run lint`.
- **Types:** TypeScript is enforced. Use `svelte-check` for component type checking.
- **Imports:** Standard ES module syntax.
- **Naming Conventions:** camelCase for variables and functions. Test files: `*.spec.ts`, `*.test.ts`, `*.svelte.spec.ts`, `*.svelte.test.ts`.
- **Error Handling:** No specific global strategy identified; rely on TypeScript and testing frameworks for error detection.

## Cursor/Copilot Rules

- No specific Cursor or Copilot rule files found in the repository.
