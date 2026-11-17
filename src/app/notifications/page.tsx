"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { INotification, IProduct } from "@/types/product";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  MessageSquare,
  Info,
  Check,
  Trash2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userHandle, setUserHandle] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("campuscart-seller-name") || "";
    }
    return "";
  });

  const fetchNotifications = useCallback(async (recipient: string) => {
    try {
      setError("");

      const url = recipient.trim()
        ? `/api/notifications?recipient=${encodeURIComponent(recipient.trim())}`
        : "/api/notifications";

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load notifications");
      }

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notifications fetch error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications(userHandle);
    }, 0);

    return () => clearTimeout(timer);
  }, [userHandle, fetchNotifications]);

  async function markAsRead(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        setNotifications((current) =>
          current.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    if (!userHandle.trim()) {
      setNotifications((current) =>
        current.map((n) => ({ ...n, isRead: true }))
      );
      return;
    }

    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: userHandle.trim() }),
      });

      if (res.ok) {
        setNotifications((current) =>
          current.map((n) => ({ ...n, isRead: true }))
        );
      }
    } catch {
      // ignore
    }
  }

  async function deleteNotification(id: string) {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications((current) => current.filter((n) => n._id !== id));
      }
    } catch {
      // ignore
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "enquiry_received":
        return <MessageSquare size={18} className="text-[#A855F7]" />;
      case "offer_accepted":
        return <CheckCircle size={18} className="text-[#22C55E]" />;
      case "offer_rejected":
        return <XCircle size={18} className="text-[#EF4444]" />;
      case "product_reserved":
        return <Clock size={18} className="text-[#F59E0B]" />;
      case "product_sold":
        return <Archive size={18} className="text-[#A1A1AA]" />;
      default:
        return <Info size={18} className="text-cyan-400" />;
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        {/* Banner */}
        <section className="relative overflow-hidden bg-[#100D1B] border-b border-[#302641] text-center py-12 px-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#A855F7]/10 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#171326] border border-[#302641] px-4 py-1.5 rounded-full text-xs font-semibold mb-3 text-[#D8B4FE]">
              <Bell size={14} className="text-[#A855F7]" />
              <span>In-App Alerts</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Activity & Notifications
            </h1>
            <p className="text-[#A1A1AA] text-sm mt-2 max-w-md mx-auto">
              Real-time records of received enquiries, accepted offers, and reservation updates.
            </p>
          </div>
        </section>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Controls Bar */}
          <div className="bg-[#171326] rounded-2xl p-4 sm:p-5 border border-[#302641] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-[#A1A1AA] shrink-0">Filter Handle:</span>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => {
                  setUserHandle(e.target.value);
                  try {
                    localStorage.setItem("campuscart-seller-name", e.target.value);
                  } catch {}
                }}
                placeholder="Enter handle or phone"
                className="bg-[#100D1B] border border-[#302641] rounded-xl px-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7] w-full sm:w-auto min-w-0"
              />
              {userHandle && (
                <button
                  onClick={() => {
                    setUserHandle("");
                    try {
                      localStorage.removeItem("campuscart-seller-name");
                    } catch {}
                  }}
                  className="text-xs text-[#A1A1AA] hover:text-[#F8FAFC] transition"
                >
                  Clear (View all)
                </button>
              )}
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#D8B4FE] hover:text-white bg-[#1E1930] hover:bg-[#251f3d] border border-[#A855F7]/30 px-3.5 py-2 rounded-xl transition w-full sm:w-auto shrink-0"
              >
                <Check size={14} className="text-[#A855F7]" />
                Mark all as read ({unreadCount})
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 text-red-200 p-4 rounded-xl text-sm mb-6 border border-red-500/50">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-[#171326] rounded-2xl p-5 border border-[#302641] animate-pulse space-y-2"
                >
                  <div className="h-4 bg-[#1E1930] rounded w-1/4" />
                  <div className="h-3 bg-[#1E1930] rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-[#171326] rounded-3xl p-12 text-center border border-[#302641] max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#F8FAFC]">
                No Notifications
              </h3>
              <p className="text-[#A1A1AA] text-sm mt-2 leading-relaxed">
                When students enquire about your listings or when a seller responds to your offers, notifications will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const relatedProd = (
                  typeof notif.relatedProduct === "object"
                    ? notif.relatedProduct
                    : null
                ) as IProduct | null;

                return (
                  <div
                    key={notif._id}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                    className={`rounded-2xl p-4 sm:p-5 border transition flex items-start justify-between gap-4 ${
                      !notif.isRead
                        ? "border-[#A855F7]/50 bg-[#171326] shadow-md shadow-purple-950/20 cursor-pointer"
                        : "border-[#302641] bg-[#100D1B]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-[#1E1930] border border-[#302641] shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#F8FAFC] text-sm">
                            {notif.title}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#A855F7] shrink-0 animate-pulse" />
                          )}
                        </div>

                        <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#71717A] mt-2">
                          <span>
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>

                          {relatedProd && (
                            <>
                              <span>•</span>
                              <Link
                                href={`/products/${relatedProd._id}`}
                                className="text-[#C084FC] font-semibold hover:underline flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View {relatedProd.name}
                                <ExternalLink size={12} />
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif._id);
                        }}
                        className="p-1.5 text-[#71717A] hover:text-[#EF4444] rounded-lg hover:bg-[#1E1930] transition"
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
