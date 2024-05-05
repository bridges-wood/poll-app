import { Button } from '@org/ui-kit/ui/button';
import {
  AvatarIcon,
  BellIcon,
  DotsHorizontalIcon,
  GlobeIcon,
  HomeIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import Link from 'next/link';
import { FC } from 'react';

interface HomeSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const HomeSidebar: FC<HomeSidebarProps> = (props) => {
  return (
    <div {...props}>
      <ul>
        <li className="flex items-center gap-2">
          <HomeIcon />
          <Link href="/home">Home</Link>
        </li>
        <li className="flex items-center gap-2">
          <GlobeIcon />
          <Link href="/explore">Explore</Link>
        </li>
        <li className="flex items-center gap-2">
          <BellIcon />
          <Link href="/notifications">Notifications</Link>
        </li>
        <li className="flex items-center gap-2">
          <AvatarIcon />
          <Link href="/profile">Profile</Link>
        </li>
        <li className="flex items-center gap-2">
          <DotsHorizontalIcon />
          <Link href="/more">More</Link>
        </li>
        <li>
          <Button variant="default" className="flex items-center gap-2">
            <Pencil2Icon />
            Post
          </Button>
        </li>
      </ul>
    </div>
  );
};

export default HomeSidebar;
