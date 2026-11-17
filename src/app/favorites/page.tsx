"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import type { IProduct } from "@/types/product";
import Link from "next/link";
import { Heart, Info, Trash2, ArrowRight } from "lucide-react";

export default function FavoritesPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    try {
      const savedFavorites: string[] = JSON.parse(
        localStorage.getItem("campuscart-favorites") || "[]"
      );

      if (savedFavorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/products?includeInactive=true");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      const allItems: IProduct[] = Array.isArray(data) ? data : [];
      const favoriteProducts = allItems.filter((product) =>
        savedFavorites.includes(product._id)
      );

      setProducts(favoriteProducts);
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load favorites"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFavorites();
    }, 0);

    function handleFavoritesChanged() {
      loadFavorites();
    }

    window.addEventListener("campuscart-favorites-changed", handleFavoritesChanged);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("campuscart-favorites-changed", handleFavoritesChanged);
    };
  }, [loadFavorites]);

  function clearAllFavorites() {
    if (confirm("Are you sure you want to clear all your saved favorites?")) {
      localStorage.removeItem("campuscart-favorites");
      setProducts([]);
      window.dispatchEvent(new Event("campuscart-favorites-changed"));
    }
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
              <Heart size={14} className="fill-red-500 text-red-500" />
              <span>Wishlist</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              My Saved Favorites
            </h1>
            <p className="text-[#A1A1AA] text-sm mt-2 max-w-lg mx-auto">
              Keep track of items you are considering before purchasing or contacting sellers.
            </p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Transparency Info Box regarding Browser-Local Persistence */}
          <div className="bg-[#171326] border border-[#302641] rounded-2xl p-4 sm:p-5 mb-8 flex items-start gap-3.5 text-xs text-[#A1A1AA] leading-relaxed shadow-sm">
            <Info size={18} className="text-[#A855F7] shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-[#F8FAFC]">
                Storage & Device Persistence Note:
              </strong>{" "}
              In this lightweight version, your favorites are safely persisted in this browser&apos;s local storage. They remain intact across page reloads and browser sessions on this device.
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#F8FAFC]">
                Saved Items ({products.length})
              </h2>
            </div>

            {products.length > 0 && (
              <button
                onClick={clearAllFavorites}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-300 hover:text-white bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 px-3.5 py-2 rounded-xl transition"
              >
                <Trash2 size={14} />
                Clear All Favorites
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-950/40 text-red-200 p-4 rounded-xl text-sm mb-6 border border-red-500/50">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#171326] rounded-2xl p-5 border border-[#302641] animate-pulse space-y-4"
                >
                  <div className="h-44 bg-[#1E1930] rounded-xl" />
                  <div className="h-5 bg-[#1E1930] rounded w-3/4" />
                  <div className="h-4 bg-[#1E1930] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    ...product,
                    id: product._id,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#171326] rounded-3xl p-12 text-center border border-[#302641] max-w-md mx-auto shadow-lg">
              <div className="w-16 h-16 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart size={30} className="text-[#A855F7]" />
              </div>

              <h3 className="text-xl font-bold text-[#F8FAFC]">
                No Favorites Saved Yet
              </h3>

              <p className="text-[#A1A1AA] text-sm mt-2 leading-relaxed">
                Tap the heart icon on any product card in the marketplace to add items to your wishlist.
              </p>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-6 py-3 rounded-xl mt-6 transition shadow-md shadow-purple-900/30 text-sm"
              >
                Explore Marketplace
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
