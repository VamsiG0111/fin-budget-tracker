import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';

export default function Settings() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences
        </p>
      </div>
      <p>Settings page coming soon...</p>
    </div>
  );
}