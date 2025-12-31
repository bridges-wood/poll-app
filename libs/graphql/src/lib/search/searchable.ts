import { Type } from '@nestjs/common';
import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { MetadataLoader } from '@nestjs/graphql/dist/plugin/metadata-loader';
import {
  EnumMetadataValuesMapOptions,
  PropertyMetadata,
} from '@nestjs/graphql/dist/schema-builder/metadata';
import { getFieldsAndDecoratorForType } from '@nestjs/graphql/dist/schema-builder/utils/get-fields-and-decorator.util';
import {
  inheritTransformationMetadata,
  inheritValidationMetadata,
} from '@nestjs/mapped-types';
import { NumberFieldFilterArgs, StringFieldFilterArgs } from './fields';

/**
 * Utility type to extract keys of a specific type from a given type T.
 * @arguments T - The type to extract keys from.
 * @arguments V - The value type to match keys against.
 *
 * @example
 * type Example = {
 *   name: string;
 *   age: number;
 *   isActive: boolean;
 *   address?: string;
 * };
 *
 * type StringKeys = TypeKey<Example, string>; // "name" | "address"
 * type NumberKeys = TypeKey<Example, number>; // "age"
 * type BooleanKeys = TypeKey<Example, boolean>; // "isActive"
 */
type TypeKey<T, V> = {
  [K in keyof T]: T[K] extends V | undefined ? K : never;
}[keyof T];

type StringKeys<T> = Exclude<TypeKey<T, string>, '__typename'>;
type NumberKeys<T> = TypeKey<T, number>;
type BooleanKeys<T> = TypeKey<T, boolean>;
type SupportedKeys<T> = StringKeys<T> | NumberKeys<T> | BooleanKeys<T>;

export type ISearchFilter<T> = {
  [key in StringKeys<T>]?: StringFieldFilterArgs;
} & {
  [key in NumberKeys<T>]?: NumberFieldFilterArgs;
} & {
  [key in BooleanKeys<T>]?: boolean;
} & {
  has?: SupportedKeys<T>[]; // Enum
};

export function Searchable<T>(classRef: Type<T>): Type<ISearchFilter<T>> {
  const { fields } = getFieldsAndDecoratorForType(classRef);

  @InputType({
    isAbstract: true,
  })
  abstract class SearchableObjectType {}

  inheritValidationMetadata(classRef, SearchableObjectType);
  inheritTransformationMetadata(classRef, SearchableObjectType);

  function applyFields(fields: PropertyMetadata[]) {
    applySearchableFields(fields);
    applyHasFields(fields);
  }
  applyFields(fields);

  // Register a refresh hook to update the fields when the serialized metadata
  // is loaded from file.
  MetadataLoader.addRefreshHook(() => {
    const { fields } = getFieldsAndDecoratorForType(classRef, {
      overrideFields: true,
    });

    applyFields(fields);
  });

  Object.defineProperty(SearchableObjectType, 'name', {
    value: `${classRef.name}SearchArgs`,
  });
  return SearchableObjectType as Type<ISearchFilter<T>>;

  function applySearchableFields(searchFields: PropertyMetadata[]) {
    searchFields.forEach((item) => {
      switch (item.typeFn()) {
        case String:
          Field(() => StringFieldFilterArgs, {
            nullable: true,
            description: `Filter arguments for objects with the \`${item.name}\` field.`,
          })(SearchableObjectType.prototype, item.name);
          break;
        case Number:
          Field(() => NumberFieldFilterArgs, {
            nullable: true,
            description: `Filter arguments for objects with the \`${item.name}\` field.`,
          })(SearchableObjectType.prototype, item.name);
          break;
        case Boolean:
          Field(() => Boolean, {
            nullable: true,
            description: `Filter arguments for objects with the \`${item.name}\` field.`,
          })(SearchableObjectType.prototype, item.name);
          break;
      }
    });
  }

  function applyHasFields(fields: PropertyMetadata[]) {
    const optionalFields = fields.filter((field) => field.options.nullable);
    // Create enum from search fields
    const enumValues = optionalFields.reduce(
      (acc, item) => {
        acc[item.name] = item.name;
        return acc;
      },
      {} as { [key: string]: string },
    );

    registerEnumType(enumValues, {
      name: `${classRef.name}SearchHas`,
      valuesMap: optionalFields.reduce(
        (acc, item) => {
          acc[item.name] = { description: item.description };
          return acc;
        },
        {} as Record<string, EnumMetadataValuesMapOptions>,
      ),
    });

    Field(() => [enumValues], {
      nullable: true,
      description: `Matches \`${classRef.name}\` objects which have specified fields.`,
    })(SearchableObjectType.prototype, 'has');
  }
}
