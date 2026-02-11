'use client';

import React, { useState } from 'react';
import Logo from './logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X } from 'lucide-react';

const navItems = [
  { phrase: 'Home', href: '/#hero' },
  { phrase: 'How It Works', href: '/#how-it-works' },
  { phrase: 'Deals', href: '/#deals' },
  { phrase: 'FAQ', href: '/#faq' },
];

function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileOpen(false);
    if (pathname === '/' && href.includes('#')) {
      const id = href.split('#')[1];
      if (id) {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const navLinks = (
    <ul className="flex flex-col md:flex-row gap-3 md:gap-4 lg:space-x-6">
      {navItems.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="block text-white font-semibold text-base md:text-lg hover:opacity-90 py-2 md:py-0"
            onClick={(e) => handleNavClick(e, item.href)}
          >
            {item.phrase}
          </Link>
        </li>
      ))}
    </ul>
  );

  const ctaButtons = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
      {isAuthenticated ? (
        <>
          <Link
            href={user?.role === 'vendor' ? '/vendor/dashboard' : '/marketplace'}
            onClick={() => setMobileOpen(false)}
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full border-2 border-white bg-white/10 hover:bg-white/20 px-6"
            >
              <span className="text-white font-bold text-base md:text-lg">
                {user?.role === 'vendor' ? 'Dashboard' : 'Marketplace'}
              </span>
            </Button>
          </Link>
          <Button
            size="lg"
            variant="ghost"
            className="rounded-full px-6 text-white hover:bg-white/20"
            onClick={() => {
              setMobileOpen(false);
              logout();
            }}
          >
            <span className="font-bold text-base md:text-lg">Logout</span>
          </Button>
        </>
      ) : (
        <>
          <Link href="/auth/student/login" onClick={() => setMobileOpen(false)}>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto rounded-full border-2 border-white bg-white hover:bg-white/90 px-6"
            >
              <span className="text-[#1D4ED8] font-bold text-base md:text-lg">
                Login
              </span>
            </Button>
          </Link>
          <Link href="/auth/vendor/register" onClick={() => setMobileOpen(false)}>
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full bg-white hover:bg-white/90 px-6 text-[#1D4ED8] font-bold text-base md:text-lg"
            >
              Partner with us
            </Button>
          </Link>
        </>
      )}
    </div>
  );

  return (
    <header className="w-full relative z-40">
      <nav className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo color="white" />
        </Link>

        {/* Desktop: nav + CTA */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks}
          {ctaButtons}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex lg:hidden relative z-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full min-w-[44px] min-h-[44px] touch-manipulation"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMobileOpen((o) => !o);
            }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-[57px] z-50 bg-[#1D4ED8] border-b border-white/20 shadow-lg px-4 py-6">
          <div className="flex flex-col gap-6 max-w-md mx-auto">
            {navLinks}
            {ctaButtons}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
