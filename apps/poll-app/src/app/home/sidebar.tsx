'use client'; // TODO break slidy button out into its own component
import { Button } from '@org/ui-kit/ui/button';
import {
  Sheet,
  SheetContent,
  SheetPortal,
  SheetTrigger,
} from '@org/ui-kit/ui/sheet';
import { Description, DialogTitle } from '@radix-ui/react-dialog';
import {
  AvatarIcon,
  BellIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
  GlobeIcon,
  HomeIcon,
  Pencil2Icon,
} from '@radix-ui/react-icons';
import { motion, useSpring } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ComponentPropsWithoutRef,
  FC,
  useEffect,
  useRef,
  useState,
} from 'react';

const HomeSidebar: FC<ComponentPropsWithoutRef<'div'>> = ({ ...props }) => {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [sidebarContainerDOMRect, setSidebarDOMRect] = useState<DOMRect | null>(
    null,
  );
  const [triggerDOMRect, setTriggerDOMRect] = useState<DOMRect | null>(null);
  const [frozen, setFrozen] = useState<boolean>(false);

  const y = useSpring(0, { damping: 36, stiffness: 800 });

  useEffect(() => {
    if (sidebarContainerRef.current) {
      setSidebarDOMRect(sidebarContainerRef.current.getBoundingClientRect());
    }
  }, [sidebarContainerRef]);

  useEffect(() => {
    if (triggerRef.current) {
      setTriggerDOMRect(triggerRef.current.getBoundingClientRect());
    }
  }, [triggerRef]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!sidebarContainerDOMRect || !triggerDOMRect || frozen) return;
      const mouseY = event.clientY;
      // Get the distance from the top of the sidebar-container
      const targetY = mouseY - 112 - 0.5 * triggerDOMRect.height;

      const safeTargetY = Math.min(
        Math.max(targetY, 0), // Stop it from going past the top of the sidebar
        sidebarContainerDOMRect.height - 112, // Stop it from going past the bottom of the sidebar
      );

      y.set(safeTargetY);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [sidebarContainerDOMRect, triggerDOMRect, frozen]);

  return (
    <div id="sidebar-container" {...props} ref={sidebarContainerRef}>
      <Sheet onOpenChange={(open) => setFrozen(open)}>
        <SheetTrigger asChild>
          <motion.div style={{ y }}>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              ref={triggerRef}
            >
              <ChevronRightIcon />
              Menu
            </Button>
          </motion.div>
        </SheetTrigger>
        <SheetPortal>
          <SheetContent
            className="h-full w-[200px] flex-col rounded-r-md rounded-t-none px-0"
            side="left"
          >
            <DialogTitle asChild>
              <h1 className="my-2 px-6 text-center text-5xl font-extralight">
                Menu
              </h1>
            </DialogTitle>
            <Description hidden>
              Menu of options for interacting with Poll App
            </Description>
            <ul className="">
              <li>
                <Link
                  href="/home"
                  className="hover:bg-background-inset hover:text-foreground mr-2 flex p-2 pl-4 align-baseline hover:rounded-r-md data-[active=true]:font-bold"
                  data-active={pathname === '/home'}
                >
                  <div className="flex items-center">
                    <HomeIcon height={16} width={16} />
                    <span className="pl-[1ex]">Home</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/explore"
                  className="hover:bg-background-inset hover:text-foreground mr-2 flex p-2 pl-4 align-baseline hover:rounded-r-md data-[active=true]:font-bold"
                  data-active={pathname === '/explore'}
                >
                  <div className="flex items-center">
                    <GlobeIcon height={16} width={16} />
                    <span className="pl-[1ex]">Explore</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/notifications"
                  className="hover:bg-background-inset hover:text-foreground mr-2 flex p-2 pl-4 align-baseline hover:rounded-r-md data-[active=true]:font-bold"
                  data-active={pathname === '/notifications'}
                >
                  <div className="flex items-center">
                    <BellIcon height={16} width={16} />
                    <span className="pl-[1ex]">Notifications</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="hover:bg-background-inset hover:text-foreground mr-2 flex p-2 pl-4 align-baseline hover:rounded-r-md data-[active=true]:font-bold"
                  data-active={pathname === '/profile'}
                >
                  <div className="flex items-center">
                    <AvatarIcon height={16} width={16} />
                    <span className="pl-[1ex]">Profile</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link
                  href="/more"
                  className="hover:bg-background-inset hover:text-foreground mr-2 flex p-2 pl-4 align-baseline hover:rounded-r-md data-[active=true]:font-bold"
                  data-active={pathname === '/more'}
                >
                  <div className="flex items-center">
                    <DotsHorizontalIcon height={16} width={16} />
                    <span className="pl-[1ex]">More</span>
                  </div>
                </Link>
              </li>
              <li
                id="divider"
                className="border-border-neutral-muted border-thin mx-auto mt-2 w-4/5 rounded-full border-t"
              />
              <li className="mt-4 px-6">
                <Button
                  variant="outline"
                  className="flex w-full items-center gap-2"
                  onClick={() => router.push('/new-post')}
                >
                  <Pencil2Icon />
                  Post
                </Button>
              </li>
            </ul>
          </SheetContent>
        </SheetPortal>
      </Sheet>
    </div>
  );
};

export default HomeSidebar;
