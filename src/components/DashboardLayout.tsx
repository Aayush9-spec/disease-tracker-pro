import { ReactNode } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Activity, LayoutDashboard, FileText, MapPin, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuth();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "officer", "viewer"] },
    { path: "/cases", label: "Cases", icon: FileText, roles: ["admin", "officer", "viewer"] },
    { path: "/map", label: "Map View", icon: MapPin, roles: ["admin", "officer", "viewer"] },
    { path: "/admin", label: "Admin", icon: Settings, roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole))
  );

  if (!user) {
    return null; // Or loading spinner
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl">HealthWatch</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {filteredNavItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive(item.path) ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            {user.email}
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;