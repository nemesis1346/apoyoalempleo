"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const navigationItems = [
  { name: "Jobs", href: "/empleos", icon: "💼" },
  { name: "Companies", href: "/empresas", icon: "🏢" },
  { name: "Contacts", href: "/contactos", icon: "📞" },
  { name: "Guía", href: "/guia", icon: "📖" },
];

const baseNavItemClasses =
  "flex items-center justify-center py-2 gap-2 rounded-xl text-xl font-medium text-center text-white grow border border-white/12 shadow-md bg-white/7 transition-all duration-300 hover:shadow-xl hover:translate-y-[-1px] hover:bg-white/18";

export default function Navigation() {
  const pathname = usePathname();

  // Memoize navigation items with computed classes
  const desktopNavItems = useMemo(() => {
    return navigationItems.map((item, index) => {
      const itemClasses = `${baseNavItemClasses}`;

      return (
        <div key={item.href} className="flex gap-1 items-center">
          <Link href={item.href} className={`${itemClasses}`} prefetch={true}>
            <div className="flex flex-col md:flex-row items-center gap-0 md:gap-1">
              <span className="text-xl md:text-2xl">{item.icon}</span>
              <span className="text-xs md:text-xl">{item.name}</span>
            </div>
          </Link>
          {index !== navigationItems.length - 1 && (
            <div className="w-px h-8 bg-white/20" />
          )}
        </div>
      );
    });
  }, [pathname]);

  return (
    <nav className="bg-[#B276CA] shadow-lg sticky top-0 z-50 backdrop-blur-sm px-4">
      <div className="container max-w-screen-md mx-auto py-2">
        <div className="flex justify-between items-center h-14">
          {/* Desktop Navigation */}
          <div className="grid grid-cols-4 gap-1 w-full">{desktopNavItems}</div>
        </div>
      </div>
    </nav>
  );
}
