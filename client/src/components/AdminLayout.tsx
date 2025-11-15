import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Newspaper, 
  Calendar, 
  Image, 
  ShoppingCart, 
  Users, 
  FileText,
  Settings,
  LogOut,
  Music,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Notícias",
    url: "/admin/noticias",
    icon: Newspaper,
  },
  {
    title: "Eventos",
    url: "/admin/eventos",
    icon: Calendar,
  },
  {
    title: "Galeria",
    url: "/admin/galeria",
    icon: Image,
  },
  {
    title: "Produtos",
    url: "/admin/produtos",
    icon: ShoppingCart,
  },
  {
    title: "Biografia",
    url: "/admin/biografia",
    icon: FileText,
  },
  {
    title: "Comentários",
    url: "/admin/comentarios",
    icon: MessageSquare,
  },
  {
    title: "Utilizadores",
    url: "/admin/utilizadores",
    icon: Users,
  },
  {
    title: "Spotify",
    url: "/admin/spotify",
    icon: Music,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/admin/login");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Snowman</h2>
                <p className="text-xs text-muted-foreground">Backoffice</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        data-active={location === item.url}
                        data-testid={`nav-${item.title.toLowerCase()}`}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4">
            <div className="text-xs text-muted-foreground mb-2">
              Logged in as <span className="font-medium text-foreground">{user.username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b bg-card">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">Role:</span>{" "}
                <span className="font-medium capitalize">{user.role}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
