import { Type } from '@nestjs/common';
import { Field, InputType } from '@nestjs/graphql';

export function BetweenFilter<T>(typeRef: Type<T>) {
  @InputType({ isAbstract: true })
  abstract class BetweenFilterArgs {
    @Field((type) => typeRef, {
      description: 'Greater than or equal to this value',
    })
    min: T;

    @Field((type) => typeRef, {
      description: 'Less than or equal to this value',
    })
    max: T;
  }

  return BetweenFilterArgs;
}
