import { Test, TestingModule } from '@nestjs/testing';
import { LocalSearchService } from './local-search.service';
import { ISearchFilter } from './searchable';

interface TestItem {
  name: string;
  age: number;
  active: boolean;
  unsupported?: null;
}

class TestLocalSearchService extends LocalSearchService<TestItem> {
  public override search(
    items: TestItem[],
    filter: ISearchFilter<TestItem>,
  ): TestItem[] {
    return super.search(items, filter);
  }
}

describe('LocalSearchService', () => {
  let service: TestLocalSearchService;
  let items: TestItem[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TestLocalSearchService,
          useValue: new TestLocalSearchService(),
        },
      ],
    }).compile();

    service = module.get<TestLocalSearchService>(TestLocalSearchService);
    items = [
      { name: 'Alice', age: 25, active: true },
      { name: 'Bob', age: 30, active: false },
      { name: 'Charlie', age: 35, active: true, unsupported: null },
    ];
  });

  it('should filter items by string field', () => {
    const filter: ISearchFilter<TestItem> = {
      name: { eq: 'Alice' },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([{ name: 'Alice', age: 25, active: true }]);
  });

  it('should filter items by string field with like arg', () => {
    const filter: ISearchFilter<TestItem> = {
      name: { like: new RegExp('^A') },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([{ name: 'Alice', age: 25, active: true }]);
  });

  it('should filter items by number field with less than arg', () => {
    const filter: ISearchFilter<TestItem> = {
      age: { lt: 30 },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([{ name: 'Alice', age: 25, active: true }]);
  });

  it('should filter items by number field with less than or equal arg', () => {
    const filter: ISearchFilter<TestItem> = {
      age: { lte: 30 },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([
      { name: 'Alice', age: 25, active: true },
      { name: 'Bob', age: 30, active: false },
    ]);
  });

  it('should filter items by number field with equal arg', () => {
    const filter: ISearchFilter<TestItem> = {
      age: { eq: 30 },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([{ name: 'Bob', age: 30, active: false }]);
  });

  it('should filter items by number field with in arg', () => {
    const filter: ISearchFilter<TestItem> = {
      age: { in: [25, 35] },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([
      { name: 'Alice', age: 25, active: true },
      { name: 'Charlie', age: 35, active: true, unsupported: null },
    ]);
  });

  it('should filter items by boolean field', () => {
    const filter: ISearchFilter<TestItem> = {
      active: true,
    };
    const result = service.search(items, filter);
    expect(result).toEqual([
      { name: 'Alice', age: 25, active: true },
      { name: 'Charlie', age: 35, active: true, unsupported: null },
    ]);
  });

  it('should not filter items by unsupported field', () => {
    const filter: ISearchFilter<TestItem> = {
      unsupported: null,
    } as unknown as ISearchFilter<TestItem>;
    const result = service.search(items, filter);
    expect(result).toEqual(items);
  });

  it('should filter items by multiple fields', () => {
    const filter: ISearchFilter<TestItem> = {
      name: { eq: 'Alice' },
      active: true,
    };
    const result = service.search(items, filter);
    expect(result).toEqual([{ name: 'Alice', age: 25, active: true }]);
  });

  it('should filter items by number range', () => {
    const filter: ISearchFilter<TestItem> = {
      age: { between: { min: 26, max: 34 } },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([{ name: 'Bob', age: 30, active: false }]);
  });

  it('should filter items by string inclusion', () => {
    const filter: ISearchFilter<TestItem> = {
      name: { in: ['Alice', 'Charlie'] },
    };
    const result = service.search(items, filter);
    expect(result).toEqual([
      { name: 'Alice', age: 25, active: true },
      { name: 'Charlie', age: 35, active: true, unsupported: null },
    ]);
  });

  it('should filter items by presence of fields', () => {
    const filter: ISearchFilter<TestItem> = {
      has: ['name', 'age'],
    };
    const result = service.search(items, filter);
    expect(result).toEqual(items);
  });
});
