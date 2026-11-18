"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, User, Sparkles, MapPin } from "lucide-react";

export interface ProductCardProps {
  product: {
    _id?: string;
    id: string;
    name: string;
    price: number;
    category: string;
    condition: string;
    emoji?: string;
    image?: string;
    seller: string;
    description: string;
    listingType?: string;
    status?: string;
    isActive?: boolean;
    location?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const productId = product.id || product._id || "";

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const favorites: string[] = JSON.parse(
          localStorage.getItem("picksy-favorites") || "[]"
        );
        setIsFavorite(favorites.includes(productId));
      } catch {
        // LocalStorage fallback
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [productId]);

  function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    try {
      const favorites: string[] = JSON.parse(
        localStorage.getItem("picksy-favorites") || "[]"
      );

      let updatedFavorites: string[];

      if (favorites.includes(productId)) {
        updatedFavorites = favorites.filter((id) => id !== productId);
        setIsFavorite(false);
      } else {
        updatedFavorites = [...favorites, productId];
        setIsFavorite(true);
      }

      localStorage.setItem(
        "picksy-favorites",
        JSON.stringify(updatedFavorites)
      );

      window.dispatchEvent(new Event("picksy-favorites-changed"));
    } catch {
      // Ignore
    }
  }

  const type = product.listingType || "For Sale";
  const status = product.status || "Available";
  const isDeactivated = product.isActive === false;

  // Badge helpers
  function getConditionBadge() {
    switch (product.condition) {
      case "New":
      case "Like New":
        return "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30";
      case "Good":
        return "bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30";
      default:
        return "bg-[#71717A]/20 text-[#A1A1AA] border-[#71717A]/30";
    }
  }

  return (
    <div className="bg-[#171326] rounded-2xl border border-[#302641] overflow-hidden hover:border-[#A855F7]/50 hover:shadow-[0_0_22px_-4px_rgba(168,85,247,0.22)] transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1">
      <div>
        {/* Media Container */}
        <div className="relative bg-[#100D1B] aspect-[4/3] flex items-center justify-center overflow-hidden border-b border-[#302641]">
          {product.image && !imageError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#171326] to-[#100D1B]">
              <span className="text-6xl group-hover:scale-110 transition duration-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.3)] select-none">
                {product.emoji || "📦"}
              </span>
              <span className="text-[11px] text-[#71717A] mt-2">Picksy</span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            className="absolute top-3 right-3 p-2 rounded-xl bg-[#090711]/75 backdrop-blur-md border border-[#302641] text-[#A1A1AA] hover:text-[#EF4444] hover:border-[#EF4444]/40 transition shadow-sm"
          >
            <Heart
              size={16}
              className={`transition ${
                isFavorite
                  ? "fill-[#EF4444] text-[#EF4444] scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                  : "hover:text-[#EF4444]"
              }`}
            />
          </button>

          {/* Badges on Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold tracking-wider uppercase backdrop-blur-md shadow-xs border ${
                type === "Free"
                  ? "bg-[#22C55E]/90 text-white border-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                  : type === "Exchange"
                  ? "bg-[#06B6D4]/90 text-white border-[#06B6D4] drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "bg-[#9333EA]/90 text-white border-[#A855F7]/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                }`}
            >
              {type === "Free" ? "FREE" : type === "Exchange" ? "EXCHANGE" : "FOR SALE"}
            </span>

            {isDeactivated ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#71717A]/80 text-[#F8FAFC] border border-[#71717A]">
                Deactivated
              </span>
            ) : status === "Reserved" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#F59E0B]/85 text-white border border-[#F59E0B]">
                Reserved
              </span>
            ) : status === "Sold" ? (
              <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#302641] text-[#A1A1AA] border border-[#302641]">
                Sold Out
              </span>
            ) : null}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-2 gap-2">
            <span className="font-medium bg-[#1E1930] text-[#D8B4FE] px-2 py-0.5 rounded-md border border-[#302641] truncate">
              {product.category}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getConditionBadge()}`}
            >
              {product.condition}
            </span>
          </div>

          <Link href={`/products/${productId}`}>
            <h3 className="text-base font-bold text-[#F8FAFC] line-clamp-1 group-hover:text-[#A855F7] transition">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-[#A1A1AA] mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Location indicator if present */}
          {product.location && (
            <div className="flex items-center gap-1 text-[11px] text-[#71717A] mt-2">
              <MapPin size={11} className="text-[#A855F7] shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
          )}

          <div className="mt-3.5 flex items-baseline justify-between pt-3 border-t border-[#302641]/60">
            <div>
              <p className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
                {type === "Free" ? (
                  <span className="text-[#22C55E] drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">
                    FREE
                  </span>
                ) : type === "Exchange" ? (
                  <span className="text-[#06B6D4] text-lg font-bold">
                    EXCHANGE
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-[#A855F7] mr-0.5">₹</span>
                    {product.price}
                  </>
                )}
              </p>
            </div>

            {/* Seller profile link */}
            <Link
              href={`/seller/${encodeURIComponent(product.seller)}`}
              className="inline-flex items-center gap-1 text-xs text-[#A1A1AA] hover:text-[#A855F7] hover:underline transition max-w-[130px] truncate"
              title={`View ${product.seller}'s profile`}
            >
              <User size={12} className="shrink-0 text-[#A855F7]" />
              <span className="truncate">{product.seller}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#302641]/60">
          <Link
            href={`/products/${productId}`}
            className="text-center text-xs font-semibold bg-[#1E1930] hover:bg-[#302641] text-[#F8FAFC] border border-[#302641] py-2.5 rounded-xl transition"
          >
            Details
          </Link>

          {status === "Available" && !isDeactivated ? (
            <Link
              href={`/products/${productId}/enquire`}
              className="text-center text-xs font-semibold bg-[#A855F7] hover:bg-[#9333EA] text-white py-2.5 rounded-xl transition shadow-[0_0_12px_-2px_rgba(168,85,247,0.35)] flex items-center justify-center gap-1"
            >
              <Sparkles size={13} />
              Enquire
            </Link>
          ) : (
            <span className="text-center text-xs font-medium bg-[#100D1B] text-[#71717A] border border-[#302641] py-2.5 rounded-xl cursor-not-allowed">
              {status === "Sold"
                ? "Sold Out"
                : isDeactivated
                  ? "Inactive"
                  : "Reserved"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
