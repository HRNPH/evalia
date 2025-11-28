# Nx Commands Guide

## Development Commands

### Start Services
```bash
# Start backend development server
bunx nx run backend:dev

# Start frontend development server  
bunx nx run frontend:dev

# Start both services in parallel
bunx nx run backend:dev & bunx nx run frontend:dev
```

### Build Commands
```bash
# Build backend
bunx nx run backend:build

# Build frontend
bunx nx run frontend:build

# Build all projects
bunx nx run-many --target=build --all
```

### Code Quality
```bash
# Lint backend
bunx nx run backend:lint

# Lint frontend
bunx nx run frontend:lint

# Lint all projects
bunx nx run-many --target=lint --all

# Type check backend
bunx nx run backend:type-check

# Type check frontend
bunx nx run frontend:type-check

# Type check all projects
bunx nx run-many --target=type-check --all
```

### Project Management
```bash
# Show all projects
bunx nx show projects

# View project graph (visualization)
bunx nx graph

# Show affected projects
bunx nx affected:projects

# Run commands on affected projects only
bunx nx affected --target=build
```

## Useful Nx Features

### Caching
Nx automatically caches build and lint operations to speed up subsequent runs.

### Dependency Graph
Nx understands project dependencies and runs tasks in the correct order.

### Affected Commands
Only run commands on projects that have changed since the last commit.