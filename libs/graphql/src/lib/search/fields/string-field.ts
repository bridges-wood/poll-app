import { Field, InputType } from '@nestjs/graphql';

@InputType({ isAbstract: true, description: 'Filter for string fields' })
export abstract class StringFieldFilterArgs {
  @Field({ nullable: true, description: 'Matches exactly this value' })
  eq?: string;
  @Field((type) => [String], {
    nullable: true,
    description: 'Matches any of these values',
  })
  in?: string[];
}
