"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  MessageSquare,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  PlusCircle,
  User,
  Compass,
  Home,
} from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeSeller, setActiveSeller] = useState<string>("");
  const pathname = usePathname();

  // Load current seller name and check unread notifications count
  useEffect(() => {
    let isMounted = true;

    async function checkNotifications() {
      try {
        const sellerName =
          typeof window !== "undefined"
            ? localStorage.getItem("picksy-seller-name") || ""
            : "";

        if (isMounted) {
          setActiveSeller(sellerName);
        }

        const url = sellerName
          ? `/api/notifications?recipient=${encodeURIComponent(sellerName)}`
          : "/api/notifications";

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            const unread = data.filter(
              (item: { isRead: boolean }) => !item.isRead
            ).length;
            setUnreadCount(unread);
          }
        }
      } catch {
        // Silently handle errors so the navbar never breaks
      }
    }

    checkNotifications();
    const interval = setInterval(checkNotifications, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Simplified navigation links for beginner-friendly readability
  const navLinks = [
    { href: "/", label: "Home", mobileLabel: "Home", icon: Home },
    { href: "/products", label: "Explore", mobileLabel: "Explore Products", icon: Compass },
    { href: "/favorites", label: "Favorites", mobileLabel: "Favorites", icon: Heart },
    { href: "/enquiries", label: "Enquiries", mobileLabel: "My Enquiries", icon: MessageSquare },
    { href: "/dashboard", label: "Dashboard", mobileLabel: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-[#090711]/95 backdrop-blur-md border-b border-[#302641] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-3">
          {/* Logo & Branding */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[#F8FAFC] hover:opacity-90 transition shrink-0 group"
          >
            <div className="bg-[#1E1930] p-2 rounded-xl text-[#A855F7] border border-[#302641] group-hover:border-[#A855F7]/50 transition shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]">
              <ShoppingBag size={20} />
            </div>
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-[#F8FAFC]">
                Pick<span className="text-[#A855F7] drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]">sy</span>
              </span>
              {/* Only show badge on wide screens to save horizontal space on laptops */}
              <span className="hidden xl:inline-block text-[10px] bg-[#1E1930] text-[#C084FC] px-2 py-0.5 rounded-full font-medium ml-2 border border-[#302641]">
                Student Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (visible on large screens lg: 1024px and above) */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs xl:text-sm font-medium transition flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg shrink-0 ${isActive
                      ? "text-[#A855F7] bg-[#171326] border border-[#302641] font-semibold shadow-[0_0_12px_-3px_rgba(168,85,247,0.25)]"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#100D1B]"
                    }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Notifications Icon with Glow Badge */}
            <Link
              href="/notifications"
              className="relative p-2 text-[#A1A1AA] hover:text-[#A855F7] rounded-xl hover:bg-[#171326] transition border border-transparent hover:border-[#302641] shrink-0"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#EF4444] text-[#F8FAFC] text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Active Student Profile Badge (shows on xl screens where there is plenty of room) */}
            {activeSeller ? (
              <Link
                href="/dashboard"
                className="hidden xl:flex items-center gap-1.5 text-xs text-[#D8B4FE] bg-[#171326] border border-[#302641] px-2.5 py-1.5 rounded-xl hover:border-[#A855F7]/50 transition shrink-0 max-w-[120px]"
                title={`Active student: ${activeSeller}`}
              >
                <User size={12} className="text-[#A855F7] shrink-0" />
                <span className="truncate">{activeSeller}</span>
              </Link>
            ) : null}

            {/* Sell Product CTA */}
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 bg-[#A855F7] text-[#F8FAFC] text-xs xl:text-sm font-semibold px-3.5 xl:px-4 py-2 rounded-xl hover:bg-[#9333EA] transition shadow-[0_0_18px_-3px_rgba(168,85,247,0.45)] hover:shadow-[0_0_24px_-2px_rgba(168,85,247,0.65)] shrink-0"
            >
              <PlusCircle size={15} />
              <span>+ Sell</span>
            </Link>
          </div>

          {/* Mobile / Tablet Header Controls (visible below lg: 1024px) */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick Sell button on mobile/tablet */}
            <Link
              href="/sell"
              className="inline-flex items-center gap-1 bg-[#A855F7] text-[#F8FAFC] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#9333EA] transition shadow-xs"
            >
              <PlusCircle size={14} />
              <span>Sell</span>
            </Link>

            {/* Notification Bell */}
            <Link
              href="/notifications"
              className="relative p-2 text-[#A1A1AA] hover:text-[#A855F7] rounded-lg"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#EF4444] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#A1A1AA] hover:text-[#F8FAFC] rounded-lg border border-[#302641] bg-[#171326]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (visible when open on mobile & tablets) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#302641] bg-[#100D1B] px-4 pt-3 pb-6 space-y-1.5 shadow-xl">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${isActive
                    ? "bg-[#171326] text-[#A855F7] font-semibold border border-[#302641]"
                    : "text-[#A1A1AA] hover:text-[#F8FAFC] hover:bg-[#171326]"
                  }`}
              >
                <Icon size={18} className="text-[#A855F7]" />
                <span>{link.mobileLabel}</span>
              </Link>
            );
          })}

          <Link
            href="/notifications"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#A1A1AA] hover:bg-[#171326] transition"
          >
            <span className="flex items-center gap-3">
              <Bell size={18} className="text-[#A855F7]" />
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="bg-[#EF4444] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </Link>

          {activeSeller && (
            <div className="px-3.5 py-2 text-xs text-[#71717A] flex items-center gap-2 border-t border-[#302641]/60 mt-3 pt-3">
              <User size={14} className="text-[#A855F7]" />
              <span>
                Active student profile:{" "}
                <strong className="text-[#D8B4FE] font-medium">{activeSeller}</strong>
              </span>
            </div>
          )}

          <div className="pt-3">
            <Link
              href="/sell"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-[#A855F7] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#9333EA] transition shadow-[0_0_20px_-3px_rgba(168,85,247,0.5)]"
            >
              <PlusCircle size={17} />
              + Post a New Listing
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
