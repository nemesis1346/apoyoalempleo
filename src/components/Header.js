"use client";

import Link from "next/link";
import { useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";

export default function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, openAuthModal, loading, isValidatingToken } = useAuth();
  const menuRef = useRef(null);

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
  }, [logout]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  // Close menu with Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && userMenuOpen) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [userMenuOpen]);

  return (
    <>
      <div className="bg-[#5E3FA6] px-2 md:px-4 py-2">
        <div className="container max-w-screen-md mx-auto py-2 flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <img src="/logo.png" alt="Apoyo AI Empleo" className="h-8.5" />
          </Link>

          {/* Auth Section */}
          {loading ? (
            // Show loading skeleton to prevent blinking
            <div className="flex items-center gap-2 px-2 py-1 bg-[#ffffffd9] text-[#4B004B] rounded-md font-medium font-semibold duration-400 text-sm shadow-md hover:bg-white/90 hover:shadow-lg cursor-pointer border-2 border-[#ffffffb3]">
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-12 h-4 bg-gray-300 rounded animate-pulse"></div>
              <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2 py-1 bg-[#ffffffd9] text-[#4B004B] rounded-md font-medium font-semibold duration-400 text-sm shadow-md hover:bg-white/90 hover:shadow-lg cursor-pointer border-2 border-[#ffffffb3]"
              >
                <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs relative">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                  {isValidatingToken && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <span>{user.firstName}</span>
                {isValidatingToken && (
                  <div className="text-xs text-gray-500 animate-pulse">
                    Validating...
                  </div>
                )}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-100">
                  {(user.role === "super_admin" ||
                    user.role === "company_admin") && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    href="/applications"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    📋 My Applications
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="text-white cursor-pointer"
            >
              <div className="flex items-center gap-1 px-2 py-2 bg-white/80 text-purple-600 rounded-md font-medium font-semibold duration-400 text-sm shadow-md hover:bg-white/90 hover:shadow-lg">
                <span>🔒</span>
                <span>Login</span>
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
