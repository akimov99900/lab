# @lab Workspace

A pnpm monorepo workspace for reusable @lab packages.

## Overview

This workspace contains a collection of reusable TypeScript/JavaScript packages under the `@lab` namespace. All packages follow shared build, linting, and formatting conventions.

## Project Structure

```
├── packages/
│   ├── package-a/
│   ├── package-b/
│   └── ...
├── pnpm-workspace.yaml    # Workspace configuration
├── tsconfig.base.json     # Shared TypeScript config
├── .eslintrc.json         # ESLint configuration
└── .prettierrc.json       # Prettier configuration
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher

### Installation

Install all workspace dependencies:

```bash
pnpm install
```

## Development

### Building

Build all packages:

```bash
pnpm build
```

Build a specific package:

```bash
pnpm -F @lab/package-name build
```

### Linting

Lint all packages:

```bash
pnpm lint
```

### Formatting

Format all files with Prettier:

```bash
pnpm format
```

### Testing

Run tests for all packages:

```bash
pnpm test
```

## CI Pipeline

Run the full CI pipeline locally (install, lint, build, test):

```bash
pnpm ci
```

## Adding New Packages

1. Create a new directory under `packages/`
2. Add a `package.json` with the package name prefixed with `@lab/`
3. Create a `src/` directory with your TypeScript files
4. Create a `tsconfig.json` that extends `../../tsconfig.base.json`
5. Add build scripts to your package.json

Example package structure:

```
packages/my-package/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Package Build Configuration

Each package should have a build script configured to:

- Compile TypeScript to ESM and CJS outputs
- Generate type declarations
- Output to `dist/` directory

Recommended tools:

- **tsup** - For fast bundling with ESM/CJS support
- **tsc** - For TypeScript compilation

## Scripts

- `pnpm build` - Build all packages
- `pnpm test` - Run tests for all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all code with Prettier
- `pnpm ci` - Run the complete CI pipeline

## License

MIT
