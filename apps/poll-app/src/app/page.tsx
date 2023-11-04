import { Button, Flex, Text } from '@radix-ui/themes';

export default async function Index() {
  return (
    <Flex direction="column" gap="2">
      <Text>Hello from Radix Themes :)</Text>
      <Button className='h-14'>Let&apos;s go!</Button>
    </Flex>
  );
}
