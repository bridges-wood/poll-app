# AGENTS.md

## Project Overview

`poll-app` is an Nx monorepo for a GraphQL-based polling platform with:

- Backend services (`apps/api-gateway`, `apps/auth-service`, `apps/user-service`, `apps/post-service`) built with NestJS/Node.
- Frontend web app (`apps/poll-app`) built with Next.js.
- Shared libraries in `libs/*` (auth, graphql, ui-kit, config, logging, etc.).
- Service and app deployment manifests under `apps/*/kube` and cluster-level config in `config/`.

Primary stack:

- Package manager: `yarn` (Berry, declared as `yarn@4.5.0`)
- Build orchestration: `nx`
- Language: TypeScript
- Unit/integration tests: Jest
- Frontend e2e: Cypress (`apps/poll-app-e2e`)

## Setup Commands

### Prerequisites

- Node.js compatible with the workspace dependencies
- Yarn 4+ (Corepack recommended)
- Docker Desktop (for local container + cluster workflow)
- Minikube, kubectl, Helm (for local infra deployment)

### Install

- Install dependencies: `yarn install`

### Verify workspace

- List projects: `yarn nx show projects`
- Inspect one project config: `yarn nx show project poll-app --json`

## Development Workflow

Prefer running all tasks via Nx from repository root.

### Run services/apps

- API gateway: `yarn nx run api-gateway:serve:development`
- Auth service: `yarn nx run auth-service:serve:development`
- User service: `yarn nx run user-service:serve:development`
- Post service: `yarn nx run post-service:serve:development`
- Web app: `yarn nx run poll-app:serve:development`

To run several projects together, use `run-many` with `--projects=...`.

### Build

- Build all projects: `yarn nx run-many --target=build --all=true`
- Build one project: `yarn nx run poll-app:build:production`

### GraphQL schema/code generation

- Generate one service schema (example): `yarn nx run auth-service:generate`
- Stitch and generate shared GraphQL artifacts: `yarn nx run graphql:generate`

## Testing Instructions

### Test commands

- Run all Jest-based tests: `yarn nx run-many --target=test --all=true`
- Run one project tests: `yarn nx run api-gateway:test`
- CI-style test run for one project: `yarn nx run api-gateway:test:ci`
- Frontend e2e (Cypress): `yarn nx run poll-app-e2e:e2e`
- Service e2e (Jest, example): `yarn nx run auth-service-e2e:e2e`

### Affected/test-on-change workflow

The repo’s pre-commit flow runs:

- `yarn nx affected --target=build`
- `yarn nx affected --target=lint --parallel=true`
- `yarn nx affected --target=test --parallel=true --configuration=ci`

Before opening a PR, run the same affected commands (or broader equivalents) and fix failures.

### Test locations

- App and library unit tests are colocated (e.g. `*.spec.ts`, `*.test.ts(x)`).
- Service e2e suites live in `apps/*-e2e` (mostly Jest).
- Frontend browser e2e lives in `apps/poll-app-e2e` (Cypress).

## Code Style Guidelines

- TypeScript-first codebase; keep code strongly typed.
- Respect workspace path aliases from `tsconfig.base.json` (e.g. `@org/*`).
- Use ESLint via Nx targets (`lint`) instead of ad hoc lint commands.
- Formatting uses Prettier with `singleQuote: true` and `prettier-plugin-tailwindcss`.
- Follow existing project boundaries; `@nx/enforce-module-boundaries` is enabled.
- Keep changes focused; avoid broad refactors unrelated to the task.

## Build and Deployment

### Containers

Most deployable apps expose a `container` target:

- Example: `yarn nx run api-gateway:container`
- CI push variant (where configured): `yarn nx run api-gateway:container:ci`

### Local cluster bootstrap

- Use `./start.sh` to:
  - ensure Docker is up,
  - start Minikube,
  - install Consul via Helm,
  - apply manifests from `config/kube` and `apps/*/kube`.

## Security Considerations

- Never commit secrets from local env files (for example `.env.local`).
- Treat tokens/credentials used by Docker, Helm, Kubernetes, and Consul as sensitive.
- Use existing auth and GraphQL patterns in shared libs instead of introducing custom auth flows ad hoc.
- If adding endpoints/resolvers, ensure authorization is enforced consistently with neighboring code.

## Monorepo Instructions

- Root contains the authoritative Nx workspace config.
- Apps live under `apps/`; shared packages live under `libs/`.
- Prefer project-scoped commands (`yarn nx run <project>:<target>`) while iterating.
- Use affected commands for faster local validation and CI parity.
- If adding a new service, mirror existing service project structure, targets, Dockerfile, and `kube` manifests.

## Pull Request Guidelines

- Keep commits and PRs scoped to a single logical change.
- Commit message guidance in `.github/git-commit-instructions.md`:
  - imperative subject,
  - concise subject line,
  - optional branch prefix (`[branch-name]`) when not on `main`.
- Before requesting review, run at minimum: build, lint, and tests for affected projects.

## Debugging & Troubleshooting

- If Nx command flags are uncertain, use `--help` (for example `yarn nx run-many --help`).
- If task resolution fails, inspect project config with `yarn nx show project <project> --json`.
- For local infra issues, re-run `./start.sh` and verify Docker/Minikube/kubectl connectivity.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
