"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { IEnquiry, IProduct } from "@/types/product";
import {
  MessageSquare,
  User,
  Phone,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Mode: "received" (as seller) vs "all" vs "sent" (as buyer)
  const [activeTab, setActiveTab] = useState<"received" | "sent" | "all">("all");
  const [sellerFilter, setSellerFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("Picksy-seller-name") || "";
    }
    return "";
  });
  const [buyerFilter, setBuyerFilter] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("Picksy-buyer-phone") || "";
    }
    return "";
  });

  const fetchEnquiries = useCallback(async () => {
    try {
      let url = "/api/enquiries";
      if (activeTab === "received" && sellerFilter.trim()) {
        url = `/api/enquiries?seller=${encodeURIComponent(sellerFilter.trim())}`;
      } else if (activeTab === "sent" && buyerFilter.trim()) {
        url = `/api/enquiries?buyerPhone=${encodeURIComponent(buyerFilter.trim())}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load enquiries.");
      }

      setEnquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch enquiries error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong loading enquiries."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, sellerFilter, buyerFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEnquiries();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchEnquiries]);

  async function updateStatus(id: string, status: "Accepted" | "Rejected") {
    setUpdatingId(id);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update enquiry.");
      }

      setSuccessMessage(data.message || `Enquiry marked as ${status}.`);
      await fetchEnquiries();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update enquiry status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  function handleSellerNameSave(name: string) {
    setSellerFilter(name);
    try {
      localStorage.setItem("Picksy-seller-name", name);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        {/* Header */}
        <section className="relative overflow-hidden bg-[#100D1B] border-b border-[#302641] text-center py-12 px-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#A855F7]/10 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#171326] border border-[#302641] px-4 py-1.5 rounded-full text-xs font-semibold mb-3 text-[#D8B4FE]">
              <MessageSquare size={14} className="text-[#A855F7]" />
              <span>Campus Negotiations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Buyer Enquiries & Offers
            </h1>
            <p className="text-[#A1A1AA] text-sm mt-2 max-w-xl mx-auto">
              Manage incoming questions, review proposed offer prices, and accept or decline deals.
            </p>
          </div>
        </section>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs and Filter Control */}
          <div className="bg-[#171326] rounded-2xl border border-[#302641] p-4 sm:p-5 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tab Switcher */}
              <div className="flex flex-wrap sm:flex-nowrap bg-[#100D1B] p-1 rounded-xl text-xs font-semibold border border-[#302641] w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg transition ${
                    activeTab === "all"
                      ? "bg-[#A855F7] text-white shadow-sm"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  All Marketplace
                </button>

                <button
                  onClick={() => setActiveTab("received")}
                  className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg transition ${
                    activeTab === "received"
                      ? "bg-[#A855F7] text-white shadow-sm"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  Received as Seller
                </button>

                <button
                  onClick={() => setActiveTab("sent")}
                  className={`flex-1 sm:flex-initial text-center px-3 py-2 rounded-lg transition ${
                    activeTab === "sent"
                      ? "bg-[#A855F7] text-white shadow-sm"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  Sent as Buyer
                </button>
              </div>

              {/* Identity input when filtering */}
              {activeTab === "received" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs w-full sm:w-auto">
                  <span className="text-[#A1A1AA] font-medium shrink-0">Seller Name:</span>
                  <input
                    type="text"
                    value={sellerFilter}
                    onChange={(e) => handleSellerNameSave(e.target.value)}
                    placeholder="Enter your seller name"
                    className="bg-[#100D1B] border border-[#302641] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7] w-full sm:w-auto"
                  />
                </div>
              )}

              {activeTab === "sent" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs w-full sm:w-auto">
                  <span className="text-[#A1A1AA] font-medium shrink-0">Buyer Phone:</span>
                  <input
                    type="text"
                    value={buyerFilter}
                    onChange={(e) => {
                      setBuyerFilter(e.target.value);
                      try {
                        localStorage.setItem("Picksy-buyer-phone", e.target.value);
                      } catch {}
                    }}
                    placeholder="Your phone number"
                    className="bg-[#100D1B] border border-[#302641] rounded-lg px-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7] w-full sm:w-auto"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 text-red-200 p-4 rounded-xl text-sm mb-6 border border-red-500/50">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-300 p-4 rounded-xl text-sm mb-6 border border-emerald-500/50">
              <CheckCircle size={18} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Enquiry List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#171326] rounded-2xl p-6 border border-[#302641] animate-pulse space-y-3"
                >
                  <div className="h-5 bg-[#1E1930] rounded w-1/3" />
                  <div className="h-4 bg-[#1E1930] rounded w-1/2" />
                  <div className="h-12 bg-[#1E1930] rounded" />
                </div>
              ))}
            </div>
          ) : enquiries.length === 0 ? (
            <div className="bg-[#171326] rounded-3xl p-12 text-center border border-[#302641] max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={30} />
              </div>

              <h3 className="text-xl font-bold text-[#F8FAFC]">
                No Enquiries Found
              </h3>

              <p className="text-[#A1A1AA] text-sm mt-2 leading-relaxed">
                {activeTab === "received"
                  ? "You have not received any buyer enquiries for your listings yet."
                  : activeTab === "sent"
                  ? "You have not submitted any enquiries yet."
                  : "No enquiries have been posted in the marketplace yet."}
              </p>

              <Link
                href="/products"
                className="inline-block mt-6 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-purple-900/30 text-sm"
              >
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {enquiries.map((enquiry) => {
                const product = (
                  typeof enquiry.product === "object" ? enquiry.product : null
                ) as IProduct | null;

                const isPending = enquiry.status === "Pending";
                const isAccepted = enquiry.status === "Accepted";
                const isRejected = enquiry.status === "Rejected";

                return (
                  <div
                    key={enquiry._id}
                    className="bg-[#171326] rounded-2xl p-5 sm:p-6 border border-[#302641] hover:border-[#A855F7]/50 transition shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#302641]">
                      <div>
                        {product ? (
                          <Link
                            href={`/products/${product._id}`}
                            className="text-lg font-bold text-[#F8FAFC] hover:text-[#C084FC] transition flex items-center gap-1.5"
                          >
                            <span>{product.emoji || "📦"}</span>
                            <span>{product.name}</span>
                            <ExternalLink size={14} className="text-[#71717A]" />
                          </Link>
                        ) : (
                          <span className="text-base font-bold text-[#71717A]">
                            Product Unavailable
                          </span>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA] mt-1">
                          {product && (
                            <>
                              <span>
                                Seller:{" "}
                                <strong className="text-[#F8FAFC]">
                                  {product.seller}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Listed Price:{" "}
                                <strong className="text-[#C084FC]">
                                  {product.listingType === "Free"
                                    ? "FREE"
                                    : product.listingType === "Exchange"
                                    ? "EXCHANGE"
                                    : `₹${product.price}`}
                                </strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border ${
                          isAccepted
                            ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/40"
                            : isRejected
                            ? "bg-rose-950/50 text-rose-300 border-rose-500/40"
                            : "bg-amber-950/50 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {isAccepted && <CheckCircle size={13} />}
                        {isRejected && <XCircle size={13} />}
                        {isPending && <Clock size={13} />}
                        <span>{enquiry.status}</span>
                      </span>
                    </div>

                    {/* Buyer Message Body */}
                    <div className="py-4 space-y-2.5">
                      <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-1.5 text-[#F8FAFC]">
                          <User size={14} className="text-[#A855F7]" />
                          <span>
                            Buyer: <strong>{enquiry.buyerName}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#A1A1AA]">
                          <Phone size={14} className="text-[#A855F7]" />
                          <a
                            href={`tel:${enquiry.buyerPhone}`}
                            className="hover:text-[#C084FC] hover:underline"
                          >
                            {enquiry.buyerPhone}
                          </a>
                        </div>
                      </div>

                      {/* Offered Price Highlight */}
                      {enquiry.offerPrice !== null &&
                        enquiry.offerPrice !== undefined && (
                          <div className="inline-flex items-center gap-1.5 bg-[#1E1930] text-[#D8B4FE] border border-[#A855F7]/40 px-3 py-1.5 rounded-xl text-xs font-semibold">
                            <Tag size={14} className="text-[#A855F7]" />
                            <span>Offered Price: ₹{enquiry.offerPrice}</span>
                          </div>
                        )}

                      {/* Message Text */}
                      <div className="bg-[#100D1B] rounded-xl p-3.5 text-sm text-[#F8FAFC] leading-relaxed border border-[#302641]">
                        &quot;{enquiry.message}&quot;
                      </div>

                      <div className="text-[11px] text-[#71717A]">
                        Received on{" "}
                        {new Date(enquiry.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Actions for Pending Enquiries */}
                    {isPending && (
                      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#302641]">
                        <button
                          onClick={() => updateStatus(enquiry._id, "Accepted")}
                          disabled={updatingId === enquiry._id}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition disabled:opacity-50 shadow-sm"
                        >
                          <CheckCircle size={14} />
                          {updatingId === enquiry._id ? "Processing..." : "Accept Offer & Reserve"}
                        </button>

                        <button
                          onClick={() => updateStatus(enquiry._id, "Rejected")}
                          disabled={updatingId === enquiry._id}
                          className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition disabled:opacity-50 shadow-sm"
                        >
                          <XCircle size={14} />
                          {updatingId === enquiry._id ? "Processing..." : "Decline Offer"}
                        </button>

                        <a
                          href={`tel:${enquiry.buyerPhone}`}
                          className="text-xs font-medium text-[#D8B4FE] hover:text-white ml-auto flex items-center gap-1 transition"
                        >
                          <Phone size={14} />
                          Call Buyer
                        </a>
                      </div>
                    )}
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
