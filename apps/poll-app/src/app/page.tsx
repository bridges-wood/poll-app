import { gql } from '@apollo/client';
import { getClient } from '@org/graphql/server';
import { Button, Flex, Text } from '@radix-ui/themes';

export default async function Index() {
  const { data } = await getClient().query({
    query: gql`
      query {
        user(id: "s") {
          name
        }
      }
    `,
  });

  return (
    <Flex direction="column" gap="2">
      <Text>Hello from Radix Themes :) {data.user.name}</Text>
      <Button className="h-14">Let&apos;s go!</Button>
    </Flex>
  );
}
