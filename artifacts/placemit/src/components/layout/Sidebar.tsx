import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  Users,
  MessageSquare,
  Award,
  FileText,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Students", href: "/students", icon: Users },
  { name: "Community", href: "/community", icon: MessageSquare },
  { name: "Experiences", href: "/experiences", icon: Award },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Applications", href: "/applications", icon: Send },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-sidebar-primary">
          <Building2 className="w-6 h-6" />
          <span>PlaceMIT</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            S
          </div>
          <div className="text-sm font-medium text-sidebar-foreground">Student User</div>
        </div>
      </div>
    </div>
  );
}