import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'generated/schema.gql',
  generates: {
    'libs/graphql/src/lib/generated/react.tsx': {
      plugins: ['typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
      },
    },
    'libs/graphql/src/lib/generated/types.ts': {
      plugins: ['typescript'],
    },
    'libs/graphql/src/lib/generated/nest.ts': {
      plugins: ['@bridges-wood/graphql-codegen-nestjs'],
      config: {
        disableDescriptions: true,
        strictScalars: true,
        scalars: {
          DateTime: 'Date',
        },
      },
    },
  },
};

export default config;
