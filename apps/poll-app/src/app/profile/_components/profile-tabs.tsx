import {
  RoutedTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@org/ui-kit/ui/tabs';
import { Suspense, lazy } from 'react';

const ProfileTabs = () => {
  const ProfileTab = lazy(() => import('./tabs/profile-tab'));
  const AccountTab = lazy(() => import('./tabs/account-tab'));
  const AppearanceTab = lazy(() => import('./tabs/appearance-tab'));

  return (
    <RoutedTabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="notifications" disabled>
          Notifications
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Suspense fallback={'Loading...'}>
          <ProfileTab />
        </Suspense>
      </TabsContent>
      <TabsContent value="account">
        <Suspense fallback={'Loading...'}>
          <AccountTab />
        </Suspense>
      </TabsContent>
      <TabsContent value="appearance">
        <Suspense fallback={'Loading...'}>
          <AppearanceTab />
        </Suspense>
      </TabsContent>
    </RoutedTabs>
  );
};

export default ProfileTabs;
