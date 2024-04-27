import {
  RoutedTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@org/ui-kit/ui/tabs';
import { lazy } from 'react';

const ProfileTabs = () => {
  const ProfileTab = lazy(() => import('./tabs/profile-tab'));
  const AccountTab = lazy(() => import('./tabs/account-tab'));
  const AppearanceTab = lazy(() => import('./tabs/appearance-tab'));

  return (
    <RoutedTabs
      defaultValue="profile"
      orientation="horizontal"
      className="flex w-full flex-col"
    >
      <div className="inline-flex">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications" disabled>
            Notifications
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="profile">
        <ProfileTab />
      </TabsContent>
      <TabsContent value="account">
        <AccountTab />
      </TabsContent>
      <TabsContent value="appearance">
        <AppearanceTab />
      </TabsContent>
    </RoutedTabs>
  );
};

export default ProfileTabs;
