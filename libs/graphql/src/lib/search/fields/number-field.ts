import { Field, InputType } from '@nestjs/graphql';
import { BetweenFilter } from './between-filter';

@InputType({ isAbstract: true })
export class NumberBetweenFilter extends BetweenFilter(Number) {}

@InputType({ isAbstract: true, description: 'Filter for number fields' })
export abstract class NumberFieldFilterArgs {
  @Field({ nullable: true, description: 'Less than this value' })
  lt?: number;
  @Field({ nullable: true, description: 'Less than or equal to this value' })
  lte?: number;
  @Field({ nullable: true, description: 'Equal to this value' })
  eq?: number;
  @Field((type) => [Number], {
    nullable: true,
    description: 'Equal to any of these values',
  })
  in?: number[];
  @Field(() => NumberBetweenFilter, {
    nullable: true,
    description: 'Not equal to this value',
  })
  between?: NumberBetweenFilter;
}
