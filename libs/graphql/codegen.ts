import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'generated/schema.gql',
  documents: 'libs/graphql/src/lib/documents/**/*.{gql,graphql}',
  generates: {
    'libs/graphql/src/lib/generated/index.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-urql'],
      config: {
        withHooks: false,
        withComponent: false,
        withHOC: false,
        urqlImportFrom: '@urql/core',
        scalars: {
          DateTime: {
            input: 'Date',
            output: 'string',
          },
        },
      },
    },
    'libs/graphql/assets/introspection.json': {
      plugins: ['introspection'],
      config: {
        minify: true,
      },
    },
  },
};

export default config;
