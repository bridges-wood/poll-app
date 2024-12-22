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
import { NumberFieldFilterArgs } from './fields/number-field';
import { StringFieldFilterArgs } from './fields/string-field';

type StringKey<T> = Exclude<
  {
    [K in keyof T]: T[K] extends string | undefined ? K : never;
  }[keyof T],
  '__typename'
>;

type NumberKey<T> = {
  [K in keyof T]: T[K] extends number | undefined ? K : never;
}[keyof T];

type BooleanKey<T> = {
  [K in keyof T]: T[K] extends boolean | undefined ? K : never;
}[keyof T];

type SupportedKey<T> = StringKey<T> | NumberKey<T> | BooleanKey<T>;

export type ISearchFilter<T> = {
  [key in StringKey<T>]: StringFieldFilterArgs;
} & {
  [key in NumberKey<T>]: NumberFieldFilterArgs;
} & {
  [key in BooleanKey<T>]: boolean;
} & {
  has?: SupportedKey<T>[]; // Enum
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
