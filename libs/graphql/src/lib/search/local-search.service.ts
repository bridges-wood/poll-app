import { isEmpty } from 'lodash';
import { StringFieldFilterArgs } from './fields';
import { NumberFieldFilterArgs } from './fields/number-field';
import { ISearchFilter } from './searchable';

export class LocalSearchService<T> {
  protected search(items: T[], filter: ISearchFilter<T>): T[] {
    return items
      .filter((item) => this.filterHasField(item, filter))
      .filter((item) => this.filterFields(item, filter));
  }

  private filterFields(item: T, filter: ISearchFilter<T>) {
    const filterKeys: (keyof T)[] = Object.keys(filter).filter(
      (key) => key !== 'has',
    ) as (keyof T)[];
    return filterKeys.reduce(
      (acc, key) => acc && this.filterField(item, key, filter),
      true,
    );
  }

  private filterField<T>(
    item: T,
    key: keyof T,
    filter: ISearchFilter<T>,
  ): boolean {
    switch (typeof item[key]) {
      case 'string':
        return this.filterStringField(
          item[key] as string,
          filter[key] as StringFieldFilterArgs,
        );
      case 'number':
        return this.filterNumberField(
          item[key] as number,
          filter[key] as NumberFieldFilterArgs,
        );
      case 'boolean':
        return this.filterBooleanField(
          item[key] as boolean,
          filter[key] as boolean,
        );
      default:
        return true;
    }
  }

  private filterBooleanField(value: boolean, filterArgs: boolean): boolean {
    return value === filterArgs;
  }

  private filterNumberField(
    value: number,
    filterArgs: NumberFieldFilterArgs,
  ): boolean {
    if (filterArgs.lt && value >= filterArgs.lt) return false;
    if (filterArgs.lte && value > filterArgs.lte) return false;
    if (filterArgs.eq && value !== filterArgs.eq) return false;
    if (filterArgs.in && !filterArgs.in.includes(value)) return false;
    if (filterArgs.between) {
      const { min, max } = filterArgs.between;
      if (min && value < min.valueOf()) return false;
      if (max && value > max.valueOf()) return false;
    }
    return true;
  }

  private filterStringField(
    value: string,
    filterArgs: StringFieldFilterArgs,
  ): boolean {
    if (filterArgs.eq && value !== filterArgs.eq) return false;
    if (filterArgs.in && !filterArgs.in.includes(value)) return false;
    return true;
  }

  private filterHasField(item: T, filter: ISearchFilter<T>): boolean {
    if (!filter.has) return true;
    return filter.has.reduce(
      (acc, val) => acc && !isEmpty(item[val as keyof T]),
      true,
    );
  }
}
