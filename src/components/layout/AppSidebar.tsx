import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  LayoutDashboard,
  LogOut,
  PieChart,
  Settings,
  Tag,
  TrendingUp,
  User
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

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: CreditCard },
  { title: "Categories", url: "/categories", icon: Tag },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const bottomNavItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, setOpen } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const currentPath = location.pathname;

  // Start with collapsed sidebar
  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const isActive = (path: string) => currentPath === path;
  const isExpanded = mainNavItems.some((item) => isActive(item.url));

  const getNavClassName = (path: string) =>
    isActive(path) 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "hover:bg-muted/50 transition-colors duration-200";

  // Auto-expand on hover at left edge only
  const handleMouseEnter = () => {
    setIsHovered(true);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div 
      className="fixed left-0 top-0 h-full w-2 z-50 hover:w-64 transition-all duration-300 group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar
        className={`${state === "collapsed" ? "w-2" : "w-64"} transition-all duration-300 border-r glass group-hover:w-64`}
        collapsible="none"
      >
      <SidebarHeader className={`p-4 transition-all duration-300 ${state === "collapsed" ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div className="animate-fade-in">
            <h2 className="font-bold text-lg">Budget Tracker</h2>
            <p className="text-xs text-muted-foreground">Manage your finances</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className={`px-2 transition-all duration-300 ${state === "collapsed" ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavClassName(item.url)} group transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <item.icon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="animate-fade-in">{item.title}</span>
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
                      className={`${getNavClassName(item.url)} group transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <item.icon className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span className="animate-fade-in">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={`p-4 border-t transition-all duration-300 ${state === "collapsed" ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        <div className="flex items-center gap-3 mb-3 animate-fade-in">
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
          <LogOut className="h-4 w-4" />
          <span className="ml-2">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  </div>
  );
}