"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import type { IProduct } from "@/types/product";
import {
  User,
  Phone,
  Package,
  CheckCircle,
  Archive,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface SellerData {
  name: string;
  phone: string;
  totalListings: number;
  activeCount: number;
  soldCount: number;
  reservedCount: number;
  memberSince: string;
  activeListings: IProduct[];
  soldListings: IProduct[];
  allListings: IProduct[];
}

function SellerProfileContent() {
  const params = useParams<{ name: string }>();
  const rawName = params?.name;
  const sellerName = rawName ? decodeURIComponent(rawName) : "";

  const [data, setData] = useState<SellerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "sold">("active");

  useEffect(() => {
    let isMounted = true;

    async function fetchSellerProfile() {
      if (!sellerName) return;

      try {
        setLoading(true);
        setError("");
        const res = await fetch(`/api/sellers/${encodeURIComponent(sellerName)}`);
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Failed to load seller profile");
        }

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Error loading seller profile"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchSellerProfile();

    return () => {
      isMounted = false;
    };
  }, [sellerName]);

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        {/* Header */}
        <section className="relative overflow-hidden bg-[#100D1B] border-b border-[#302641] py-12 px-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-[#A855F7]/10 blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto relative z-10">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#F8FAFC] font-semibold mb-5 transition"
            >
              <ArrowLeft size={14} />
              Back to Marketplace
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1E1930] rounded-2xl flex items-center justify-center text-[#A855F7] border border-[#A855F7]/40 text-3xl font-extrabold shadow-lg shadow-purple-950/40 shrink-0">
                  {sellerName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#F8FAFC] truncate">
                      {sellerName}
                    </h1>
                    <span className="text-[11px] bg-[#171326] text-[#D8B4FE] border border-[#302641] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 shrink-0">
                      <Sparkles size={11} className="text-[#A855F7]" />
                      Student Seller
                    </span>
                  </div>

                  {data?.memberSince && (
                    <p className="text-xs text-[#A1A1AA] mt-1.5 flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#A855F7] shrink-0" />
                      Member since{" "}
                      {new Date(data.memberSince).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {data?.phone && (
                <a
                  href={`tel:${data.phone}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold px-5 py-3 rounded-xl transition shadow-md shadow-purple-900/30 text-sm w-full sm:w-auto shrink-0"
                >
                  <Phone size={16} />
                  Call Seller ({data.phone})
                </a>
              )}
            </div>
          </div>
        </section>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 text-red-200 p-4 rounded-xl text-sm mb-6 border border-red-500/50">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#A855F7] border-t-transparent mb-3" />
              <p className="text-[#A1A1AA] text-sm">Loading seller profile...</p>
            </div>
          ) : data ? (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Total Posted</span>
                    <Package size={16} className="text-[#A855F7]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#F8FAFC] mt-2">
                    {data.totalListings}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Active Listings</span>
                    <CheckCircle size={16} className="text-[#22C55E]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#22C55E] mt-2">
                    {data.activeCount}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Reserved</span>
                    <Archive size={16} className="text-[#F59E0B]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#F59E0B] mt-2">
                    {data.reservedCount}
                  </p>
                </div>

                <div className="bg-[#171326] p-5 rounded-2xl border border-[#302641] hover:border-[#A855F7]/40 transition shadow-sm">
                  <div className="flex items-center justify-between text-[#A1A1AA] text-xs">
                    <span>Completed Sales</span>
                    <Archive size={16} className="text-[#71717A]" />
                  </div>
                  <p className="text-2xl font-extrabold text-[#A1A1AA] mt-2">
                    {data.soldCount}
                  </p>
                </div>
              </div>

              {/* Tabs: Active vs Sold */}
              <div className="flex border-b border-[#302641] mb-6 gap-6 text-sm font-bold">
                <button
                  onClick={() => setActiveTab("active")}
                  className={`pb-3 transition ${
                    activeTab === "active"
                      ? "text-[#C084FC] border-b-2 border-[#A855F7]"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  Active Listings ({data.activeListings.length})
                </button>

                <button
                  onClick={() => setActiveTab("sold")}
                  className={`pb-3 transition ${
                    activeTab === "sold"
                      ? "text-[#C084FC] border-b-2 border-[#A855F7]"
                      : "text-[#A1A1AA] hover:text-[#F8FAFC]"
                  }`}
                >
                  Past Sold Items ({data.soldListings.length})
                </button>
              </div>

              {/* Product Grid */}
              {activeTab === "active" ? (
                data.activeListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.activeListings.map((prod) => (
                      <ProductCard
                        key={prod._id}
                        product={{ ...prod, id: prod._id }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#171326] rounded-3xl p-10 text-center border border-[#302641]">
                    <p className="text-[#A1A1AA] text-sm">
                      {sellerName} currently has no active listings.
                    </p>
                  </div>
                )
              ) : data.soldListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.soldListings.map((prod) => (
                    <ProductCard
                      key={prod._id}
                      product={{ ...prod, id: prod._id }}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-[#171326] rounded-3xl p-10 text-center border border-[#302641]">
                  <p className="text-[#A1A1AA] text-sm">
                    No past sold listings recorded yet for {sellerName}.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-[#171326] rounded-3xl p-12 text-center border border-[#302641] max-w-md mx-auto shadow-lg">
              <User size={36} className="text-[#A855F7] mx-auto mb-3" />
              <h2 className="text-xl font-bold text-[#F8FAFC]">
                Seller Not Found
              </h2>
              <p className="text-[#A1A1AA] text-sm mt-1">
                No items have been listed by this student yet.
              </p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function SellerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090711] flex items-center justify-center">
          <p className="text-[#A855F7] font-semibold">Loading seller profile...</p>
        </div>
      }
    >
      <SellerProfileContent />
    </Suspense>
  );
}
