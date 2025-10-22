import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "~/components/ui/cn";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  Music, 
  Users, 
  Home, 
  Star, 
  Search,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Songs", href: "/songs", icon: Music },
  { name: "Rounds", href: "/rounds", icon: Users },
];

export function Navigation() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 border-b border-white/20 dark:border-slate-700/30 shadow-modern-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-4 hover:scale-105 transition-all duration-300">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-primary shadow-modern group-hover:shadow-modern-lg transition-all duration-300 group-hover:scale-110">
                  <Music className="h-7 w-7 text-white group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-accent rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gradient group-hover:scale-105 transition-transform duration-300">Besedila</span>
                <span className="text-xs text-muted-foreground font-medium -mt-1">Music Management</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-3">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center space-x-3 rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 relative overflow-hidden",
                      isActive
                        ? "bg-gradient-primary text-white shadow-modern-lg"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground glass hover:shadow-modern"
                    )}
                  >
                    <div className="relative z-10 flex items-center space-x-3">
                      <item.icon className={cn(
                        "h-5 w-5 transition-transform duration-300",
                        isActive ? "text-white" : "group-hover:rotate-12"
                      )} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="glass"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:scale-110 transition-all duration-300"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 rotate-90 transition-transform duration-300" />
              ) : (
                <Menu className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-strong border-t border-white/20 dark:border-slate-700/30 backdrop-blur-xl animate-slide-in-down">
          <div className="space-y-3 px-6 pb-6 pt-6">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center space-x-4 rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-primary text-white shadow-modern-lg"
                      : "text-muted-foreground hover:bg-white/10 hover:text-foreground glass hover:shadow-modern"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="relative z-10 flex items-center space-x-4">
                    <item.icon className={cn(
                      "h-6 w-6 transition-transform duration-300",
                      isActive ? "text-white" : "group-hover:rotate-12"
                    )} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
