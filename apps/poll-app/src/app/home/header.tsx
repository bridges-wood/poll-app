import { GetProfileDocument } from '@org/graphql';
import { client } from '@poll-app/lib/api';

const HomeHeader = () => {
  const { data: profile } = client.watchQuery({ query: GetProfileDocument });

  return (
    <header>
      <h1>Poll App</h1>
    </header>
  );
};

export default HomeHeader;
