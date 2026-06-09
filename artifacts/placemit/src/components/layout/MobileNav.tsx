import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Award, MessageSquare, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Experiences", href: "/experiences", icon: Award },
  { name: "Community", href: "/community", icon: MessageSquare },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { profile, logout } = useAuth();

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <>
      {/* Top bar */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border bg-sidebar">
        <Link
          href="/experiences"
          className="flex items-center gap-2 font-bold text-lg text-sidebar-primary"
        >
          <Award className="w-5 h-5" />
          <span>PlaceMIT</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-between px-5 border-b border-sidebar-border">
          <span className="font-bold text-lg text-sidebar-primary">
            PlaceMIT
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile?.name ?? "Student"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.branch ?? ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
