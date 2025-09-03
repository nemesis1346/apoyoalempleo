"use client";

import { usePathname } from "next/navigation";
import Navigation from "./Navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function ConditionalLayout({ children }) {
  const pathname = usePathname();

  // Check if we're in the admin section
  const isAdminPage = pathname.startsWith("/admin");

  // If it's an admin page, return just the children without site layout
  if (isAdminPage) {
    return <>{children}</>;
  }

  // For all other pages, return the normal site layout
  return (
    <div className="overflow-y-auto h-screen">
      <Header />
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
