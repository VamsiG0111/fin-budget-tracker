import { useState } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ProfileDropdown } from "@/components/profile/ProfileDropdown";

export function Layout() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
        <AppSidebar onExpandChange={setIsExpanded} />
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${
          isExpanded ? 'ml-64' : 'ml-16'
        }`}>
          {/* Enhanced Global header for all pages */}
          <header className="flex h-20 shrink-0 items-center gap-4 border-b-2 border-primary/20 bg-gradient-to-r from-card via-card/95 to-card backdrop-blur-lg shadow-lg shadow-primary/10 px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-primary/30 shadow-md">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                  Budget Tracker
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Personal Finance Dashboard</span>
              </div>
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