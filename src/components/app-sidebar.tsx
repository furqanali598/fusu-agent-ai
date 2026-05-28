import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Bot, Map, Brain, TrendingUp, Trophy,
  Users, BarChart3, Building2, LogOut, Sparkles, GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";

const studentItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Mentor", url: "/mentor", icon: Bot },
  { title: "Roadmap", url: "/roadmap", icon: Map },
  { title: "Quizzes", url: "/quiz", icon: Brain },
  { title: "Progress", url: "/progress", icon: TrendingUp },
  { title: "Achievements", url: "/achievements", icon: Trophy },
];
const adminItems = [{ title: "Admin Panel", url: "/admin", icon: BarChart3 }];
const clientItems = [{ title: "University Insights", url: "/client", icon: Building2 }];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items =
    user?.role === "admin" ? [...studentItems, ...adminItems]
    : user?.role === "client" ? [...studentItems, ...clientItems]
    : studentItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="size-8 rounded-lg gradient-brand grid place-items-center text-primary-foreground shrink-0">
            <Sparkles className="size-4" />
          </div>
          <span className="font-bold group-data-[collapsible=icon]:hidden">FuSu AI Agent</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Learn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:hidden">
          <div className="size-9 rounded-full bg-accent grid place-items-center">
            <GraduationCap className="size-4 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={logout} title="Sign out">
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
