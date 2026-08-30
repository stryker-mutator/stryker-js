# GitHub Copilot Cloud Agent Instructions for StrykerJS

## Repository Overview

StrykerJS is a **mutation testing framework for JavaScript/TypeScript**. It works by making small, deliberate changes ("mutants") to source code and verifying that the existing test suite catches them. A surviving mutant indicates a gap in test coverage.

**Current version:** 9.6.1  
**Language:** TypeScript (strict mode, ESM modules, `Node16` module resolution)  
**Package manager:** pnpm (v10+, required — do not use npm or yarn)  
**Node requirement:** ≥20.0.0  
**Monorepo tooling:** Lerna + pnpm workspaces

---

## Repository Structure

```
stryker-js/
├── packages/              # All published npm packages (pnpm workspace)
│   ├── api/               # @stryker-mutator/api — public plugin interfaces & types
│   ├── core/              # @stryker-mutator/core — main mutation testing orchestrator
│   ├── instrumenter/      # @stryker-mutator/instrumenter — AST-based mutant insertion
│   ├── util/              # @stryker-mutator/util — shared utilities
│   ├── test-helpers/      # @stryker-mutator/test-helpers — shared test utilities
│   ├── create-stryker/    # CLI scaffolding tool
│   ├── mocha-runner/      # Test runner plugin for Mocha
│   ├── jest-runner/       # Test runner plugin for Jest
│   ├── jasmine-runner/    # Test runner plugin for Jasmine
│   ├── karma-runner/      # Test runner plugin for Karma
│   ├── vitest-runner/     # Test runner plugin for Vitest
│   ├── cucumber-runner/   # Test runner plugin for Cucumber
│   ├── tap-runner/        # Test runner plugin for TAP
│   ├── typescript-checker/# Type-check mutants with TypeScript
│   └── grunt-stryker/     # Grunt task plugin
├── e2e/                   # End-to-end tests (separate pnpm workspace)
├── perf/                  # Performance tests
├── tasks/                 # Build/code-gen helper scripts
├── docs/                  # Documentation
├── tsconfig.json          # Root TypeScript project references
├── tsconfig.settings.json # Shared TS compiler options
├── eslint.config.js       # Flat ESLint config (TypeScript + Prettier)
├── lerna.json             # Lerna configuration
└── pnpm-workspace.yaml    # pnpm workspace definition
```

### Package dependency order (bottom → top)
`util` → `api` → `instrumenter` → `core` → runners/checkers

---

## Build System

### Full workspace build
```bash
# Install all dependencies
pnpm install

# Generate JSON schema types (must run before first tsc build)
pnpm run generate

# Compile everything (TypeScript project references)
pnpm run build

# Or build without type-checking (faster, use during development)
pnpm run build:no-check
```

### Watch mode (for development)
```bash
pnpm start   # runs `tsc -b -w` at the root
```

### Individual package build
```bash
cd packages/core
npx tsc -b   # honors project references
```

**Important:** TypeScript uses [project references](https://www.typescriptlang.org/docs/handbook/project-references.html). Always build from the workspace root with `pnpm run build` before running package-level tests. Each package has a `tsconfig.json` that delegates to `tsconfig.src.json` and `tsconfig.test.json`.

---

## Testing

### Run all unit tests (all packages)
```bash
pnpm test   # uses lerna --concurrency 2
```

### Run tests for a single package
```bash
cd packages/core
pnpm test          # runs unit + integration tests with c8 coverage
pnpm run test:unit # unit tests only
```

### Test framework
- **Mocha** for unit and integration tests
- **Chai** + **Sinon** + **sinon-chai** for assertions/mocking
- Tests live in `packages/<pkg>/test/unit/` and `packages/<pkg>/test/integration/`
- Compiled test output is at `packages/<pkg>/dist/test/`
- Test command pattern: `mocha "dist/test/unit/**/*.js"`

### End-to-end tests (slow, separate workspace)
```bash
pnpm run e2e         # full e2e (installs + lints + runs)
pnpm run e2e:run     # just run e2e tests
```
E2e tests live in `e2e/test/<scenario>/` and test real Stryker runs against sample projects.

### Mutation testing on StrykerJS itself
```bash
cd packages/core   # or any other package
pnpm run stryker
```

---

## Linting & Formatting

```bash
# Lint all packages
pnpm run lint

# Auto-fix lint issues
pnpm run lint:fix
```

- **ESLint** flat config (`eslint.config.js`) using `typescript-eslint` + `eslint-plugin-prettier`
- **Prettier** for formatting (`.prettierrc`)
- **EditorConfig** (`.editorconfig`) for spacing rules
- All TypeScript files must pass strict lint before merge

---

## Code Style & Conventions

- **All source files are TypeScript**, strict mode, ESM (`"type": "module"`)
- Module resolution: `Node16` — always use `.js` extensions in import paths (e.g. `import { foo } from './bar.js'`)
- **Dependency injection** is done via [`typed-inject`](https://github.com/nicojs/typed-inject); tokens are defined in `di/` directories
- Exports use package `exports` map — import from sub-paths like `@stryker-mutator/api/core`, not deep file paths
- Test factories and helpers are in `packages/test-helpers/src/` — use `factory.ts` for creating test data
- Use `sinon` for stubs/spies/mocks; avoid `jest.mock()`
- No `console.log` in production code — use the logging module (`@stryker-mutator/util` logger)
- Angular-style commit messages: `<type>(<scope>): <subject>` (feat, fix, docs, refactor, test, chore)

---

## Key Architecture Concepts

### Mutation pipeline (packages/core)
1. **Prepare** (`PrepareExecutor`) — load config, set up plugins
2. **Instrument** (`MutantInstrumenterExecutor`) — insert mutants into source via `instrumenter`
3. **Dry run** (`DryRunExecutor`) — run tests once without mutations to establish baseline
4. **Mutation test** (`MutationTestExecutor`) — run tests for each mutant

### Plugin system
Plugins implement interfaces from `@stryker-mutator/api`:
- **Test runners** implement `TestRunner` (api/test-runner)
- **Checkers** implement `Checker` (api/check)
- **Reporters** implement `Reporter` (api/report)
- **Ignorer** implements `MutantFilter` (api/ignore)

Plugins are discovered via the `plugins` config option or auto-discovered from `node_modules`.

### Instrumenter (packages/instrumenter)
- Uses **Babel** to parse JavaScript/TypeScript into AST
- Each mutator in `src/mutators/` handles a specific mutation type (e.g. `ArithmeticOperatorMutator`)
- Mutants are placed via `mutant-placers/` using `switch` statements in generated code

### Schema & types
- JSON schema lives in `packages/core/schema/stryker-schema.json` (generated, do not edit manually)
- Run `pnpm run generate` to regenerate after changing schema source files in `tasks/`
- TypeScript types for options are generated from the JSON schema

---

## Common Tasks & Workflows

### Adding a new mutation operator
1. Create `packages/instrumenter/src/mutators/<name>-mutator.ts` implementing `NodeMutator`
2. Export it from `packages/instrumenter/src/mutators/index.ts`
3. Add unit tests in `packages/instrumenter/test/unit/mutators/<name>-mutator.spec.ts`
4. Build and test: `pnpm run build && cd packages/instrumenter && pnpm test`

### Modifying Stryker options/config
1. Edit the schema source (in `tasks/`)
2. Run `pnpm run generate` to regenerate the JSON schema and TypeScript types
3. Update `packages/api/src/core/` types if needed

### Adding a new package
1. Create `packages/<name>/` following existing package structure
2. Add to `tsconfig.json` references
3. Add to `pnpm-workspace.yaml` (already covered by `packages/*` glob)

### Running a single e2e scenario
```bash
cd e2e/test/<scenario-name>
pnpm install
npx stryker run   # or check the scenario's package.json scripts
```

---

## Environment Setup Issues & Known Workarounds

- **Chromium must be installed** for karma-runner tests: `pnpm run install:chromium`
- **Windows e2e**: Set `TEMP` and `TMP` to a short path (e.g., `D:\Temp`) to avoid path-length issues with karma-webpack — this is handled automatically in CI
- **Shallow clones**: The repo uses pnpm workspaces; always run `pnpm install` from the root before building packages
- **Build order matters**: If you see "cannot find module" errors in compiled JS, run `pnpm run build` from root first — project references ensure packages compile in the correct order
- **ESM imports**: All internal imports must include the `.js` extension, even for `.ts` source files. This is a `Node16` module resolution requirement
- **`pnpm run generate` must run first**: The `packages/api/src-generated/` and `packages/core/schema/` directories are generated; if they are missing, `pnpm run build` will fail

---

## CI Overview

- **CI workflow** (`.github/workflows/ci.yml`): Runs `pnpm run all` (clean + build + lint + test) on Ubuntu and Windows, Node 20 and 24
- **E2e workflow**: Runs full e2e test suite
- **Mutation testing workflow**: Incremental Stryker runs, results posted to dashboard
- **Setup action** (`.github/setup/action.yml`): Reusable composite action that sets up pnpm, Node.js, installs deps, and installs Chromium

---

## Package-Level `package.json` Scripts Pattern

Most packages follow this pattern:
```json
{
  "scripts": {
    "test": "c8 npm run test:all",
    "test:all": "npm run test:unit && npm run test:integration",
    "test:unit": "mocha \"dist/test/unit/**/*.js\"",
    "test:integration": "mocha --timeout 60000 \"dist/test/integration/**/*.js\"",
    "stryker": "node ../core/bin/stryker.js run"
  }
}
```

Coverage is collected with `c8`. Run `pnpm test` from the root to run all packages concurrently.
