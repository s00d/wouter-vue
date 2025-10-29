# Examples

This directory contains example projects demonstrating wouter-vue usage:

- **example/** - Full-featured example with wouter-vue (SSR, 200 routes, testing)
- **example-vue-router/** - Comparison example using vue-router (same features for benchmarking)

## Running Examples

From the root directory:

```bash
# Install all dependencies
pnpm install

# Run wouter-vue example
cd examples/example
pnpm run dev

# Run vue-router example  
cd examples/example-vue-router
pnpm run dev
```

## Workspace Setup

This project uses pnpm workspaces. All example dependencies are managed as devDependencies in their respective `package.json` files, and `wouter-vue` is linked via `workspace:*`.

## Testing

Each example includes comprehensive testing:

```bash
cd examples/example
pnpm run test:all  # Runs build, SSR server, Playwright, Artillery
```

