import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';

export default function Analytics() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-3xl font-bold">Analytics</h1>
            </div>
            <ProfileDropdown />
          </div>
          <p>Analytics page coming soon...</p>
        </main>
      </div>
    </SidebarProvider>
  );
}