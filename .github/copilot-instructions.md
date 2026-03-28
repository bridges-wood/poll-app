# Copilot instructions for `poll-app`

This repository is a Yarn 4 + Nx monorepo. Run commands from the repository root and prefer `yarn nx ...` over calling Jest, ESLint, Next.js, or Nest tooling directly.

## Build, test, and lint commands

- Install dependencies: `yarn install`
- List projects: `yarn nx show projects`
- Build all buildable projects: `yarn nx run-many --target=build --all=true`
- Build one project: `yarn nx run poll-app:build:production` or `yarn nx run auth-service:build:development`
- Lint one project: `yarn nx run poll-app:lint`
- Lint affected projects: `yarn nx affected --target=lint --parallel=true`
- Run all Jest-based tests: `yarn nx run-many --target=test --all=true`
- Run one project's tests: `yarn nx run api-gateway:test`
- Run a single Jest test file: `yarn nx run api-gateway:test --testFile=src/app/schema/schema-stitcher.spec.ts`
- Run service e2e tests: `yarn nx run auth-service-e2e:e2e`
- Run web e2e tests: `yarn nx run poll-app-e2e:e2e`
- Run CI-style affected validation:
  - `yarn nx affected --target=build`
  - `yarn nx affected --target=lint --parallel=true`
  - `yarn nx affected --target=test --parallel=true --configuration=ci`
- Generate one service schema: `yarn nx run auth-service:generate`
- Stitch schemas and regenerate shared GraphQL artifacts: `yarn nx run graphql:generate`
- Bootstrap local cluster and manifests: `./start.sh`

## High-level architecture

- The backend is split into NestJS applications under `apps/`: `auth-service`, `user-service`, and `post-service` expose federated GraphQL schemas, while `api-gateway` serves the public GraphQL endpoint and stitches local + remote schemas together.
- The gateway uses GraphQL Yoga and a `SchemaStitcher` that watches registered remote endpoints and rebuilds the composed schema dynamically. Remote services register themselves with the gateway on startup through the shared registration library.
- Backend services share the same building blocks: centralized config factories from `@org/config`, shared error formatting from `@org/errors`, registration/bootstrap helpers, Firebase-backed integrations, and auth/signing helpers from `@org/auth`.
- `libs/graphql` is the contract layer for the whole monorepo. Service-level `:generate` targets emit schema files into `generated/`, the `graphql:stitch`/`graphql:generate` flow combines them, and the resulting typed operations + `schema.json` are consumed by both the frontend and cross-app clients.
- The frontend app in `apps/poll-app` is a Next.js App Router app. It uses URQL on both the client and server, imports generated documents/types from `@org/graphql`, and wraps the app in GraphQL/theme/store providers from `apps/poll-app/src/components/providers`.
- Shared libraries under `libs/` are intentionally split by concern: auth, GraphQL helpers, config, logging, health/registration, Firebase integration, and UI kit packages. Prefer reusing these libraries instead of adding app-local duplicates.

## Key conventions

- Prefer project-scoped Nx commands such as `yarn nx run <project>:<target>` while iterating. This repo relies on Nx targets and caching rather than invoking underlying tools ad hoc.
- Respect the workspace aliases in `tsconfig.base.json` such as `@org/auth`, `@org/graphql`, and `@org/ui-kit/*`. Cross-project imports are expected to go through these aliases, not relative paths.
- GraphQL changes usually span more than one surface. When changing resolvers/models in a service, keep the service schema generation target and `graphql:generate` in sync so the stitched schema, generated documents, and frontend/client types stay aligned.
- New backend services should follow the existing service shape: Nest app in `apps/<service>`, shared bootstrap/registration wiring, a `build-generator` + `generate` target for schema output, container target, and matching Kubernetes manifests.
- Authentication is centralized. User- and post-facing services apply `DistributedAuthGuard` globally and opt out with the existing decorators (`@Public`, roles/current-user helpers) instead of custom per-resolver auth code.
- Service-to-service GraphQL traffic uses the existing signing and validation pipeline (`@org/auth` signing providers plus HMAC/JWT GraphQL plugins). Reuse the neighboring auth/registration patterns rather than introducing a parallel transport/auth mechanism.
- Backend apps serve HTTPS locally. The shared bootstrap path can auto-pick a port in the `4000-5000` range when one is not configured, then register the service URL back with the gateway.
- Tests are colocated with the code they cover (`*.spec.ts`, `*.test.ts(x)`), while service e2e suites live in `apps/*-e2e` and browser e2e lives in `apps/poll-app-e2e`.
