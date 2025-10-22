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
  { name: "Domov", href: "/", icon: Home },
  { name: "Pesmi", href: "/songs", icon: Music },
  { name: "Runde", href: "/rounds", icon: Users },
];

export function Navigation() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 shadow-sm">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900">Besedila</span>
                <span className="text-xs text-gray-500 font-medium -mt-1">Upravljanje glasbe</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="border-gray-300"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 rounded-lg px-4 py-3 text-base font-medium transition-colors duration-200",
                    isActive
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
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
