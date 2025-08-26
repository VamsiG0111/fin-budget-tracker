import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
  Tag,
  User,
  Wallet
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface AppSidebarProps {
  onExpandChange?: (isExpanded: boolean) => void;
}

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Categories", url: "/categories", icon: Tag },
  { title: "My Finances", url: "/finances", icon: Wallet },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const bottomNavItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar({ onExpandChange }: AppSidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const currentPath = location.pathname;
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => currentPath === path;

  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 transition-colors duration-200";

  const handleLogout = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  const handleExpand = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandChange?.(expanded);
  };

  return (
    <Sidebar
      className={`border-r glass fixed left-0 top-0 h-screen z-40 transition-all duration-300 overflow-hidden ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      collapsible="none"
      onMouseEnter={() => handleExpand(true)}
      onMouseLeave={() => handleExpand(false)}
    >
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          {isExpanded && (
            <div className="overflow-hidden transition-all duration-300">
              <h2 className="font-bold text-lg whitespace-nowrap">Budget Tracker</h2>
              <p className="text-xs text-muted-foreground whitespace-nowrap">Manage your finances</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 flex-1">
        <SidebarGroup>
          {isExpanded && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavClassName(item.url)} group transition-all duration-200 hover:scale-[1.02] ${
                        !isExpanded ? 'justify-center' : ''
                      }`}
                      title={!isExpanded ? item.title : ''}
                    >
                      <item.icon className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                        isExpanded ? 'mr-2' : 'mx-auto'
                      }`} />
                      {isExpanded && <span className="whitespace-nowrap">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={`${getNavClassName(item.url)} group transition-all duration-200 hover:scale-[1.02] ${
                        !isExpanded ? 'justify-center' : ''
                      }`}
                      title={!isExpanded ? item.title : ''}
                    >
                      <item.icon className={`h-4 w-4 group-hover:scale-110 transition-transform ${
                        isExpanded ? 'mr-2' : 'mx-auto'
                      }`} />
                      {isExpanded && <span className="whitespace-nowrap">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        {isExpanded ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-[1.02]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Logout</span>
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-8 h-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}