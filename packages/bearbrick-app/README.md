# BearBrick NFT App

A Next.js application for generating and minting BearBrick NFTs on Base network.

## Features

- 🎨 Generate unique BearBrick SVG art
- 🏷️ Create ERC-721 compatible metadata
- 🔗 Connect to BearBrick smart contract
- 📱 Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 8.x or higher

### Installation

```bash
# From the monorepo root
pnpm install

# Install dependencies for this specific package
pnpm --filter @lab/bearbrick-app install
```

### Development

```bash
# Start development server
pnpm --filter @lab/bearbrick-app dev

# Or from the package directory
cd packages/bearbrick-app
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
# Build for production
pnpm --filter @lab/bearbrick-app build

# Start production server
pnpm --filter @lab/bearbrick-app start
```

### Linting & Type Checking

```bash
# Lint code
pnpm --filter @lab/bearbrick-app lint

# Check types
pnpm --filter @lab/bearbrick-app typecheck
```

## Environment Variables

Create a `.env.local` file based on `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Configure the following variables:

- `NEXT_PUBLIC_BEARBRICK_NFT_ADDRESS`: The deployed BearBrick NFT contract address
- `NEXT_PUBLIC_BASE_RPC_URL`: RPC URL for Base network (defaults to mainnet)

## Usage

1. Enter your Farcaster ID (FID)
2. Enter your username
3. Click "Generate BearBrick NFT"
4. Preview your unique BearBrick
5. Use the generated Token URI for minting

## Integration with Smart Contract

This app is designed to work with the `@lab/bearbrick-contract` package. The generated Token URI can be used directly with the contract's `mint` function.

## Architecture

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **NFT Generation**: `@lab/nft-utils` package
- **Contract Interaction**: `@lab/bearbrick-contract` package
- **Authentication**: `@lab/farcaster-auth` package

## Deployment

This app is configured for deployment on Vercel with monorepo support. The root `vercel.json` defines the build command:

```bash
pnpm -w run build:dependencies && cd packages/bearbrick-app && pnpm build
```

The `-w` flag (a shortcut for `--workspace-root`) ensures the dependency build script always runs from the workspace root before the BearBrick app build kicks off.
