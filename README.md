# Poll App

## Prerequisites

- [Minikube](https://kubernetes.io/docs/tasks/tools/install-minikube/)

## Getting Started

To start the kubernetes cluster for development, run the following command:

```bash
./scripts/dev.sh
```

If you change the infrastructure configuration, you can apply the changes by running the same command again.

### Adding a new service

1. Create a new directory in the `services` directory.

```bash
nx g @nx/nest:application <service-name>
```

2. Duplicate the `build-generator` and `generate` tasks from the `project.json` file in an existing service directory.

3. Add a `scripts/generate-schema.ts` file in the new service directory.

```bash
touch services/<service-name>/scripts/generate-schema.ts
```

4. Copy the contents of the `scripts/generate-schema.ts` file from an existing service directory, removing the resolvers and scalars.

5. Add the service to the `api-gateway` serve task in the `project.json` file.

6. Add a dockerfile for the new service.

```bash
nx g @nx-tools/nx-container:configuration
```

7. Modify the dockerfile to add the following dependencies via apk:

```dockerfile
RUN apk add --no-cache libc6-compat
# Becomes -> RUN apk add --no-cache libc6-compat python3 make g++
```

8. Add a kubernetes configuration for the new service.

```bash
touch config/kube/<service-name>.yaml
```

9. Add the appropriate intentions for the service in the `intention.yaml` file.
