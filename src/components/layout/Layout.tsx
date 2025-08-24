import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ProfileDropdown } from "@/components/profile/ProfileDropdown";

export function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Global header for all pages */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b glass px-4 sticky top-0 z-40 ml-16">
            <div className="flex-1">
              <h1 className="text-2xl font-bold gradient-text-primary ml-4">Budget Tracker</h1>
            </div>
            <ProfileDropdown />
          </header>

          {/* Page content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}