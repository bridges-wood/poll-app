import { NumberFieldFilterArgs, StringFieldFilterArgs } from './fields';
import { ISearchFilter } from './searchable';

export class LocalSearchService<T> {
  public search(items: T[], filter: ISearchFilter<T>): T[] {
    const hasPredicate = this.createHasPredicate(filter);
    const fieldsPredicate = this.createFieldsPredicate(filter);

    return items.filter((item) => hasPredicate(item) && fieldsPredicate(item));
  }

  private createFieldsPredicate(
    filter: ISearchFilter<T>,
  ): (item: T) => boolean {
    const filterKeys: (keyof T)[] = Object.keys(filter).filter(
      (key) => key !== 'has',
    ) as (keyof T)[];

    if (!filterKeys.length) {
      return () => true;
    }

    const fieldPredicates = filterKeys.map((key) =>
      this.createFieldPredicate(key, filter),
    );

    return (item: T) => {
      for (const predicate of fieldPredicates) {
        if (!predicate(item)) return false;
      }
      return true;
    };
  }

  private createFieldPredicate(
    key: keyof T,
    filter: ISearchFilter<T>,
  ): (item: T) => boolean {
    return (item: T) => {
      switch (typeof item[key]) {
        case 'string':
          return this.createStringFieldPredicate(
            (filter[key] ?? {}) as StringFieldFilterArgs
          )(item[key] as string);
        case 'number':
          return this.createNumberFieldPredicate(
            (filter[key] ?? {}) as NumberFieldFilterArgs
          )(item[key] as number);
        case 'boolean':
          return this.createBooleanFieldPredicate(
            filter[key] as boolean
          )(item[key] as boolean);
        default:
          return true;
      }
    };
  }

  private createBooleanFieldPredicate(
    filterArgs: boolean,
  ): (value: boolean) => boolean {
    return (value: boolean) => value === filterArgs;
  }

  private createNumberFieldPredicate(
    filterArgs: NumberFieldFilterArgs,
  ): (value: number) => boolean {
    const inSet = filterArgs.in ? new Set(filterArgs.in) : undefined;

    return (value: number) => {
      if (filterArgs.lt && value >= filterArgs.lt) return false;
      if (filterArgs.lte && value > filterArgs.lte) return false;
      if (filterArgs.eq && value !== filterArgs.eq) return false;
      if (inSet && !inSet.has(value)) return false;
      if (filterArgs.between) {
        const { min, max } = filterArgs.between;
        if (min && value < min.valueOf()) return false;
        if (max && value > max.valueOf()) return false;
      }
      return true;
    };
  }

  private createStringFieldPredicate(
    filterArgs: StringFieldFilterArgs,
  ): (value: string) => boolean {
    const inSet = filterArgs.in ? new Set(filterArgs.in) : undefined;
    const regex = filterArgs.like;

    return (value: string) => {
      if (filterArgs.eq && value !== filterArgs.eq) return false;
      if (inSet && !inSet.has(value)) return false;
      if (regex) {
        regex.lastIndex = 0;
        if (!regex.test(value)) return false;
      }
      return true;
    };
  }

  private createHasPredicate(filter: ISearchFilter<T>): (item: T) => boolean {
    if (!filter.has) {
      return () => true;
    }

    const hasFields = filter.has as (keyof T)[];

    return (item: T) => {
      for (const field of hasFields) {
        if (!item[field]) return false;
      }
      return true;
    };
  }
}
