import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { user, showAuthDialog, setShowAuthDialog, logout } = useAuth();

  const links = [
    { href: "/", label: "Home" },
    { href: "/word-generator", label: "Word Generator" },
    { href: "/sound-changes", label: "Sound Changes" },
    { href: "/lexicon", label: "Lexicon" },
  ];

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex gap-4">
              {links.map(({ href, label }) => (
                <Link key={href} href={href}>
                  <span
                    className={cn(
                      "transition-colors hover:text-primary relative py-4 px-1 cursor-pointer",
                      location === href
                        ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </Link>
              ))}
            </div>
            <div className="relative z-50 flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-sm">
                      Signed in as {user.displayName}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowAuthDialog(true)}>Sign in</Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={() => setShowAuthDialog(false)}
      />
    </>
  );
}