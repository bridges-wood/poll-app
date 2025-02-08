import { Inject, Type } from '@nestjs/common';
import { getRepositoryToken } from './firebase.utils';

export const InjectRepository = (entity: Type): ReturnType<typeof Inject> =>
  Inject(getRepositoryToken(entity));
