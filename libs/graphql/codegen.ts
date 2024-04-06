import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'generated/schema.gql',
  documents: 'libs/graphql/src/lib/documents/**/*.{gql,graphql}',
  generates: {
    'libs/graphql/src/lib/generated/react.tsx': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
      },
    },
  },
};

export default config;
