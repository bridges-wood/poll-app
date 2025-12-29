import { ExecutionRequest } from '@graphql-tools/utils';

export interface ExtensionVisitor {
  visit(
    extensions: ExecutionRequest['extensions'],
    request: Omit<ExecutionRequest, 'extensions'>,
  ): ExecutionRequest['extensions'];
}
