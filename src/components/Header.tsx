import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";


interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  showBackButton?: boolean;
  isLoggedIn: boolean;
  onProfileClick: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  productTypeCount?: Record<string, number> | null;
}

export function Header({ cartItemsCount, onCartClick, showBackButton, isLoggedIn, onProfileClick, searchTerm, onSearchChange, productTypeCount }: HeaderProps) {
  // showBackButton is now a prop

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-8">
          <a href="#" onClick={() => window.dispatchEvent(new CustomEvent('show-home'))} style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1 className="text-xl font-bold" style={{ marginLeft: "1rem" }}>TechStore</h1>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex gap-6 text-base font-medium">
          <a href="#" aria-label="Contact Support" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
            {/* Headset with microphone icon only */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 16v-1a8 8 0 0116 0v1" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M19 16v2a2 2 0 01-2 2h-2" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="9" y="14" width="6" height="2" rx="1" fill="currentColor" />
              <circle cx="17" cy="17" r="1" fill="currentColor" />
            </svg>
            <span style={{ fontWeight: 400 }}>Contact Support</span>
          </a>

          {/* Back to Home Button - Conditionally Rendered */}
          {showBackButton && (
            <button
              type="button"
              style={{ marginLeft: '0.75rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', background: '#adb5bd', color: '#212529', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, Arial, sans-serif', boxShadow: '0 2px 8px rgba(33,37,41,0.08)' }}
              onClick={() => window.dispatchEvent(new CustomEvent('show-home'))}
            >
              ← Back to Home
            </button>
          )}
        </nav>

        {/* Search */}

        <div className="flex items-center space-x-4 ml-auto">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
            />
            {/* Show product type and count if search matches */}
            {productTypeCount && (
              <div className="absolute left-0 mt-2 w-full bg-white bg-opacity-95 border border-gray-200 rounded shadow p-2 z-50 text-sm">
                {Object.entries(productTypeCount).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span className="font-medium text-gray-700">{type}</span>
                    <span className="text-gray-500">{count} found</span>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* User Account/Profile */}
          {isLoggedIn ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Profile"
              onClick={onProfileClick}
            >
              <User className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Login"
              onClick={() => window.dispatchEvent(new CustomEvent("show-login"))}
            >
              <User className="w-6 h-6" />
            </Button>
          )}

          {/* Shopping Cart */}
          <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
            <ShoppingCart className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {cartItemsCount}
              </Badge>
            )}
          </Button>

          {/* Mobile Menu */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}