import { Link, useLocation } from "wouter";
import { MessageSquare, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Experiences", href: "/experiences", icon: Award },
  { name: "Community", href: "/community", icon: MessageSquare },
];

export function Sidebar() {
  const [location] = useLocation();
  const { profile, logout } = useAuth();

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="flex h-full w-56 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <Link href="/experiences" className="flex items-center gap-2 font-bold text-xl text-sidebar-primary">
          <Award className="w-5 h-5" />
          <span>PlaceMIT</span>
        </Link>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location.startsWith(item.href);
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
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {profile?.name ?? "Student"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {profile?.branch ?? ""}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors"
            title="Sign out"
          >
            Out
          </button>
        </div>
      </div>
    </div>
  );
}
