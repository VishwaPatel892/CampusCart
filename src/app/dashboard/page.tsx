"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { IProduct, IEnquiry } from "@/types/product";
import {
  Package,
  CheckCircle,
  Clock,
  Archive,
  MessageSquare,
  Pencil,
  Trash2,
  Power,
  ExternalLink,
  PlusCircle,
  UserCheck,
  AlertCircle,
  Tag,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [sellerName, setSellerName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("campuscart-seller-name") || "";
    }
    return "";
  });
  const [nameInput, setNameInput] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("campuscart-seller-name") || "";
    }
    return "";
  });

  const [products, setProducts] = useState<IProduct[]>([]);
  const [enquiries, setEnquiries] = useState<IEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"listings" | "enquiries">("listings");

  const loadDashboardData = useCallback(async (seller: string) => {
    if (!seller.trim()) {
      setLoading(false);
      return;
    }

    try {
      setError("");

      const [prodRes, enqRes] = await Promise.all([
        fetch(`/api/products?seller=${encodeURIComponent(seller.trim())}&includeInactive=true`),
        fetch(`/api/enquiries?seller=${encodeURIComponent(seller.trim())}`),
      ]);

      const [prodData, enqData] = await Promise.all([
        prodRes.json(),
        enqRes.json(),
      ]);

      if (prodRes.ok) {
        setProducts(Array.isArray(prodData) ? prodData : []);
      }
      if (enqRes.ok) {
        setEnquiries(Array.isArray(enqData) ? enqData : []);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sellerName) {
        loadDashboardData(sellerName);
      } else {
        setLoading(false);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [sellerName, loadDashboardData]);

  function handleSaveSellerName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = nameInput.trim();
    if (!clean) {
      setError("Please enter your seller name.");
      return;
    }
    localStorage.setItem("campuscart-seller-name", clean);
    setSellerName(clean);
  }

  // Update listing status (Available, Reserved, Sold)
  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    setError("");

    try {
      const res = await fetch(`/api/products/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Could not update status.");
      }

      setProducts((current) =>
        current.map((p) =>
          p._id === id ? { ...p, status: data.product.status } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed.");
    } finally {
      setUpdatingId("");
    }
  }

  // Toggle active/inactive
  async function handleToggleActive(id: string, currentActive: boolean) {
    setUpdatingId(id);
    setError("");

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Could not toggle listing status.");
      }

      setProducts((current) =>
        current.map((p) =>
          p._id === id ? { ...p, isActive: data.product.isActive } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Toggle active failed.");
    } finally {
      setUpdatingId("");
    }
  }

  // Delete product
  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this listing? All associated enquiries will also be removed.")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete product.");
      }

      setProducts((current) => current.filter((p) => p._id !== id));
      setEnquiries((current) =>
        current.filter((e) => {
          const prodId = typeof e.product === "object" ? e.product._id : e.product;
          return prodId !== id;
        })
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  // Handle Enquiry status update (Accept / Reject)
  async function handleEnquiryStatus(id: string, status: "Accepted" | "Rejected") {
    setUpdatingId(id);
    setError("");

    try {
      const res = await fetch(`/api/enquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update enquiry.");
      }

      // Reload data to reflect reserved state on products
      if (sellerName) {
        await loadDashboardData(sellerName);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enquiry update failed.");
    } finally {
      setUpdatingId("");
    }
  }

  // Compute stats
  const totalListings = products.length;
  const activeCount = products.filter(
    (p) => (p.status || "Available") === "Available" && p.isActive !== false
  ).length;
  const reservedCount = products.filter((p) => p.status === "Reserved").length;
  const soldCount = products.filter((p) => p.status === "Sold").length;

  const totalEnquiries = enquiries.length;
  const pendingOffers = enquiries.filter((e) => e.status === "Pending").length;
  const acceptedOffers = enquiries.filter((e) => e.status === "Accepted").length;
  const rejectedOffers = enquiries.filter((e) => e.status === "Rejected").length;

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        {/* Dashboard Hero */}
        <section className="relative overflow-hidden bg-[#100D1B] border-b border-[#302641] py-12 px-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-[#A855F7]/10 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <span className="text-xs bg-[#171326] border border-[#302641] text-[#D8B4FE] px-3 py-1 rounded-full font-semibold mb-2 inline-flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#A855F7]" />
                Campus Management Hub
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
                Student Seller Dashboard
              </h1>
              <p className="text-[#A1A1AA] text-sm mt-1">
                {sellerName
                  ? `Active student profile: ${sellerName}`
                  : "Track your campus listings, manage offers, and handle buyer deals."}
              </p>
            </div>

            <Link
              href="/sell"
              className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold px-5 py-3 rounded-xl transition shadow-md shadow-purple-900/30 text-sm"
            >
              <PlusCircle size={18} />
              + Add New Listing
            </Link>
          </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Seller Identification / Switcher Card */}
          <div className="bg-[#171326] rounded-2xl border border-[#302641] p-5 mb-8 shadow-sm">
            <form
              onSubmit={handleSaveSellerName}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-xl">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-[#F8FAFC] text-sm">
                    Active Student Profile:{" "}
                    <span className="text-[#C084FC] font-extrabold">
                      {sellerName || "(None set)"}
                    </span>
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Enter the name you use when posting listings to view your private metrics.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="bg-[#100D1B] border border-[#302641] text-[#F8FAFC] placeholder-[#71717A] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#A855F7] w-full sm:w-auto min-w-0 sm:min-w-[200px]"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold text-xs px-4 py-2.5 sm:py-2 rounded-xl transition w-full sm:w-auto shrink-0 shadow-xs"
                >
                  Switch Profile
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 text-red-200 p-4 rounded-xl text-sm mb-6 border border-red-500/50">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!sellerName ? (
            <div className="bg-[#171326] rounded-3xl p-12 text-center border border-[#302641] max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck size={32} />
              </div>

              <h2 className="text-xl font-bold text-[#F8FAFC]">
                Identify Your Seller Profile
              </h2>

              <p className="text-[#A1A1AA] text-sm mt-2 leading-relaxed">
                Please enter your seller name above to view your listings, track enquiries, and accept student offers.
              </p>
            </div>
          ) : (
            <>
              {/* Stats Grid - 8 Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {/* Listings Stats */}
                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Total Listings</span>
                    <Package size={16} className="text-[#A855F7]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-2">
                    {totalListings}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Active Items</span>
                    <CheckCircle size={16} className="text-[#22C55E]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#22C55E] mt-2">
                    {activeCount}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Reserved</span>
                    <Clock size={16} className="text-[#F59E0B]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#F59E0B] mt-2">
                    {reservedCount}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Sold Out</span>
                    <Archive size={16} className="text-[#71717A]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#A1A1AA] mt-2">
                    {soldCount}
                  </p>
                </div>

                {/* Enquiries Stats */}
                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Total Enquiries</span>
                    <MessageSquare size={16} className="text-[#C084FC]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-2">
                    {totalEnquiries}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Pending Offers</span>
                    <Clock size={16} className="text-[#F59E0B]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#F59E0B] mt-2">
                    {pendingOffers}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Accepted Offers</span>
                    <CheckCircle size={16} className="text-[#22C55E]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#22C55E] mt-2">
                    {acceptedOffers}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Declined</span>
                    <Archive size={16} className="text-[#EF4444]" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-[#EF4444] mt-2">
                    {rejectedOffers}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs between Listings and Enquiries */}
              <div className="flex border-b border-[#302641] mb-6 gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`pb-3 transition relative ${
                    activeTab === "listings"
                      ? "text-[#C084FC] border-b-2 border-[#A855F7]"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  My Listings ({products.length})
                </button>

                <button
                  onClick={() => setActiveTab("enquiries")}
                  className={`pb-3 transition relative ${
                    activeTab === "enquiries"
                      ? "text-[#C084FC] border-b-2 border-[#A855F7]"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  Received Enquiries ({enquiries.length})
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#A855F7] border-t-transparent mb-3" />
                  <p className="text-[#A1A1AA] text-sm">Updating your dashboard...</p>
                </div>
              ) : activeTab === "listings" ? (
                <div>
                  {products.length === 0 ? (
                    <div className="bg-[#171326] p-10 rounded-3xl border border-[#302641] text-center">
                      <p className="text-[#A1A1AA] text-sm">
                        You have not posted any listings under the name &quot;{sellerName}&quot;.
                      </p>
                      <Link
                        href="/sell"
                        className="inline-block mt-4 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-purple-900/30"
                      >
                        Create Your First Listing
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {products.map((product) => (
                        <div
                          key={product._id}
                          className="bg-[#171326] rounded-2xl p-5 border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#100D1B] border border-[#302641] rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                                  {product.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-2xl">
                                      {product.emoji || "📦"}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-bold text-[#F8FAFC] text-base">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-[#A1A1AA]">
                                    {product.category} • {product.condition}
                                  </p>
                                </div>
                              </div>

                              <span className="text-base font-extrabold text-[#C084FC]">
                                {product.listingType === "Free"
                                  ? "FREE"
                                  : product.listingType === "Exchange"
                                  ? "EXCHANGE"
                                  : `₹${product.price}`}
                              </span>
                            </div>

                            <p className="text-xs text-[#A1A1AA] mt-3 line-clamp-2">
                              {product.description}
                            </p>

                            {/* Status and Active Management */}
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#302641] text-xs">
                              <div>
                                <label className="block text-[11px] font-semibold text-[#A1A1AA] mb-1">
                                  Listing Status
                                </label>
                                <select
                                  value={product.status || "Available"}
                                  disabled={updatingId === product._id}
                                  onChange={(e) =>
                                    handleStatusChange(product._id, e.target.value)
                                  }
                                  className="w-full border border-[#302641] rounded-lg p-2 bg-[#100D1B] text-[#F8FAFC] text-xs font-semibold focus:outline-none focus:border-[#A855F7]"
                                >
                                  <option value="Available" className="bg-[#100D1B] text-[#F8FAFC]">Available</option>
                                  <option value="Reserved" className="bg-[#100D1B] text-[#F8FAFC]">Reserved</option>
                                  <option value="Sold" className="bg-[#100D1B] text-[#F8FAFC]">Sold</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-[#A1A1AA] mb-1">
                                  Visibility
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleActive(
                                      product._id,
                                      product.isActive !== false
                                    )
                                  }
                                  disabled={updatingId === product._id}
                                  className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-semibold text-xs transition border ${
                                    product.isActive !== false
                                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                                      : "bg-zinc-900 text-zinc-400 border-zinc-700"
                                  }`}
                                >
                                  <Power size={12} />
                                  {product.isActive !== false ? "Active" : "Deactivated"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Action Links */}
                          <div className="flex gap-2 mt-5 pt-3 border-t border-[#302641]">
                            <Link
                              href={`/products/${product._id}`}
                              className="flex-1 text-center text-xs font-semibold border border-[#302641] text-[#D8B4FE] py-2 rounded-lg hover:bg-[#1E1930] flex items-center justify-center gap-1 transition"
                            >
                              <ExternalLink size={12} />
                              View
                            </Link>

                            <Link
                              href={`/products/${product._id}/edit`}
                              className="flex-1 text-center text-xs font-semibold bg-[#1E1930] text-[#C084FC] border border-[#A855F7]/30 py-2 rounded-lg hover:bg-[#251f3d] flex items-center justify-center gap-1 transition"
                            >
                              <Pencil size={12} />
                              Edit
                            </Link>

                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="px-3 text-red-400 hover:bg-red-950/40 rounded-lg border border-red-500/30 transition"
                              title="Delete listing"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Enquiries Tab */
                <div>
                  {enquiries.length === 0 ? (
                    <div className="bg-[#171326] p-10 rounded-3xl border border-[#302641] text-center">
                      <p className="text-[#A1A1AA] text-sm">
                        No enquiries received yet for your listings.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {enquiries.map((enquiry) => {
                        const product = (
                          typeof enquiry.product === "object"
                            ? enquiry.product
                            : null
                        ) as IProduct | null;

                        return (
                          <div
                            key={enquiry._id}
                            className="bg-[#171326] p-5 rounded-2xl border border-[#302641] shadow-xs"
                          >
                            <div className="flex flex-wrap justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-[#F8FAFC] text-sm">
                                  {product?.name || "Product"}
                                </h4>
                                <p className="text-xs text-[#A1A1AA] mt-0.5">
                                  From: <strong className="text-[#F8FAFC]">{enquiry.buyerName}</strong> ({enquiry.buyerPhone})
                                </p>
                              </div>

                              <span
                                className={`text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                                  enquiry.status === "Accepted"
                                    ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/40"
                                    : enquiry.status === "Rejected"
                                    ? "bg-rose-950/50 text-rose-300 border-rose-500/40"
                                    : "bg-amber-950/50 text-amber-300 border-amber-500/40"
                                }`}
                              >
                                {enquiry.status}
                              </span>
                            </div>

                            <p className="text-xs text-[#F8FAFC] bg-[#100D1B] p-3 rounded-xl mt-3 border border-[#302641]">
                              {enquiry.message}
                            </p>

                            {enquiry.offerPrice !== null &&
                              enquiry.offerPrice !== undefined && (
                                <p className="text-xs font-bold text-[#C084FC] mt-2 flex items-center gap-1">
                                  <Tag size={12} className="text-[#A855F7]" />
                                  Offer Price: ₹{enquiry.offerPrice}
                                </p>
                              )}

                            {enquiry.status === "Pending" && (
                              <div className="flex gap-2 mt-4 pt-3 border-t border-[#302641]">
                                <button
                                  onClick={() =>
                                    handleEnquiryStatus(enquiry._id, "Accepted")
                                  }
                                  disabled={updatingId === enquiry._id}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                                >
                                  Accept & Reserve
                                </button>

                                <button
                                  onClick={() =>
                                    handleEnquiryStatus(enquiry._id, "Rejected")
                                  }
                                  disabled={updatingId === enquiry._id}
                                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
