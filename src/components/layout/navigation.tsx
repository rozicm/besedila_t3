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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-white/10 shadow-modern">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Music className="h-6 w-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <span className="text-2xl font-bold text-gradient group-hover:scale-105 transition-transform duration-300">Besedila</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center space-x-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105",
                      isActive
                        ? "bg-gradient-primary text-white shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground glass"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      isActive ? "text-white" : "group-hover:rotate-12"
                    )} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="glass hover:bg-white/10 transition-all duration-300 hover:scale-105"
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
        <div className="md:hidden glass border-t border-white/10 backdrop-blur-xl">
          <div className="space-y-2 px-4 pb-4 pt-4">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center space-x-3 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-300 hover:scale-105",
                    isActive
                      ? "bg-gradient-primary text-white shadow-lg"
                      : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isActive ? "text-white" : "group-hover:rotate-12"
                  )} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
