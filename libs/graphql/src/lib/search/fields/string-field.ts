import { Field, InputType } from '@nestjs/graphql';
import { RegularExpressionScalar } from '../scalars/regular-expression';

@InputType({ isAbstract: true, description: 'Filter for string fields' })
export abstract class StringFieldFilterArgs {
  @Field({ nullable: true, description: 'Matches exactly this value' })
  eq?: string;
  @Field(() => RegularExpressionScalar, {
    nullable: true,
    description: 'Matches the given pattern',
  })
  like?: RegExp;
  @Field((type) => [String], {
    nullable: true,
    description: 'Matches any of these values',
  })
  in?: string[];
}
