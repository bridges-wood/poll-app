import { Test, TestingModule } from '@nestjs/testing';
import { Node } from '@org/graphql/pagination';
import { LogModule } from '@org/log';
import { FirebaseCoreModule } from './firebase-core.module';
import { FirebaseModule } from './firebase.module';
import { FirebaseModuleOptions } from './interfaces';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
}));

describe('FirebaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FirebaseModule.forRoot()],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import FirebaseCoreModule in forRoot', () => {
    const imports = FirebaseModule.forRoot().imports;
    expect(imports).toEqual([FirebaseCoreModule.forRoot()]);
  });

  it('should import LogModule and provide entities in forFeature', () => {
    const entities = [
      class TestEntity implements Node {
        static collectionName = 'testEntities';
        static modelMapper = jest.fn();
        id = 'testId';
      },
    ];
    const options: FirebaseModuleOptions<Node> = { entities };
    const featureModule = FirebaseModule.forFeature(options);

    expect(featureModule.imports).toContain(LogModule);
    expect(featureModule.providers).toBeDefined();
    expect(featureModule.exports).toEqual(featureModule.providers);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
