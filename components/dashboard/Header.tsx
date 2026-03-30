"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  User,
  HelpCircle
} from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notifications?: number;
}

export function Header({ 
  onMenuClick, 
  userName,
  userEmail,
  userAvatar,
  notifications = 0 
}: HeaderProps) {
  const { data: session } = useSession();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    console.log("Searching for:", searchQuery);
  };

  const displayName = userName || session?.user?.name || "Admin User";
  const displayEmail = userEmail || session?.user?.email || "admin@example.com";
  const avatarInitial = displayName[0].toUpperCase();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-100 transition-all">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none text-sm w-64"
              />
            </div>
          </form>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Search Mobile */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors group"
              aria-label="User menu"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={displayName}
                  className="w-9 h-9 rounded-full object-cover border-2 border-green-500"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold shadow-md">
                  {avatarInitial}
                </div>
              )}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500">{displayEmail}</p>
              </div>
              <ChevronDown className="hidden md:block w-4 h-4 text-gray-500 transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                  <p className="text-sm font-medium text-gray-900">{displayName}</p>
                  <p className="text-xs text-gray-500 mt-1">{displayEmail}</p>
                </div>
                
                <Link
                  href="/dashboard/profile"
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Profile</span>
                </Link>
                
                <Link
                  href="/dashboard/settings"
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Settings</span>
                </Link>
                
                <Link
                  href="/help"
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Help & Support</span>
                </Link>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}