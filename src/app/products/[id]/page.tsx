"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import type { IProduct } from "@/types/product";

import {
  ArrowLeft,
  Phone,
  Package,
  User,
  Tag,
  Pencil,
  Trash2,
  Heart,
  Sparkles,
  Calendar,
  AlertCircle,
  QrCode,
  MapPin,
  X,
  Check,
  Copy,
} from "lucide-react";

function ProductDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [similarProducts, setSimilarProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch product details & similar products
  useEffect(() => {
    let isMounted = true;

    async function fetchProduct() {
      if (!id) return;

      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Product not found");
        }

        if (isMounted) {
          setProduct(data);

          // Fetch similar products in same category
          if (data.category) {
            fetch(`/api/products?category=${encodeURIComponent(data.category)}`)
              .then((res) => res.json())
              .then((list) => {
                if (isMounted && Array.isArray(list)) {
                  setSimilarProducts(
                    list
                      .filter((p: IProduct) => p._id !== id)
                      .slice(0, 3)
                  );
                }
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        console.error("Fetch Product Error:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Something went wrong"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Check favorite status
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      try {
        const favs: string[] = JSON.parse(
          localStorage.getItem("campuscart-favorites") || "[]"
        );
        setIsFavorite(favs.includes(id));
      } catch {
        // LocalStorage fallback
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [id]);

  function toggleFavorite() {
    if (!id) return;
    try {
      const favorites: string[] = JSON.parse(
        localStorage.getItem("campuscart-favorites") || "[]"
      );

      let updated: string[];
      if (favorites.includes(id)) {
        updated = favorites.filter((favId) => favId !== id);
        setIsFavorite(false);
      } else {
        updated = [...favorites, id];
        setIsFavorite(true);
      }

      localStorage.setItem("campuscart-favorites", JSON.stringify(updated));
      window.dispatchEvent(new Event("campuscart-favorites-changed"));
    } catch {
      // ignore
    }
  }

  function handleCopyShareLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  // Delete product
  async function handleDelete() {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This will also remove any enquiries received for it."
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete product");
      }

      alert("Product deleted successfully!");
      router.push("/products");
      router.refresh();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Unable to delete product"
      );
      setDeleting(false);
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090711] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#A855F7] border-t-transparent mb-4" />
          <p className="text-[#A1A1AA] font-medium">Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Product not found
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#090711] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="bg-red-950/40 text-red-300 border border-red-500/40 p-4 rounded-2xl inline-block mb-4">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC]">
            Product Not Found
          </h1>
          <p className="text-[#A1A1AA] mt-2 text-sm leading-relaxed">
            {error || "This listing is either unavailable, has been sold, or was removed by the student."}
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-purple-900/30 text-sm"
          >
            Browse Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const type = product.listingType || "For Sale";
  const status = product.status || "Available";
  const isAvailable = status === "Available" && product.isActive !== false;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#D8B4FE] hover:text-white transition"
            >
              <ArrowLeft size={16} />
              Back to Marketplace
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQrModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#171326] border border-[#302641] hover:border-[#A855F7] text-[#D8B4FE] hover:text-white transition shadow-sm"
                title="Share QR Code"
              >
                <QrCode size={15} />
                Share QR
              </button>

              <button
                onClick={toggleFavorite}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#171326] border border-[#302641] hover:border-[#A855F7] text-[#D8B4FE] hover:text-white transition shadow-sm"
              >
                <Heart
                  size={15}
                  className={isFavorite ? "fill-red-500 text-red-500" : ""}
                />
                {isFavorite ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Product details card */}
          <div className="bg-[#171326] rounded-3xl border border-[#302641] overflow-hidden shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Media Section */}
              <div className="relative bg-[#100D1B] p-8 flex items-center justify-center min-h-[360px] md:min-h-[460px] border-b md:border-b-0 md:border-r border-[#302641]">
                {product.image && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={() => setImageError(true)}
                    className="max-h-[400px] w-auto max-w-full rounded-2xl object-contain shadow-md"
                  />
                ) : (
                  <span className="text-9xl drop-shadow-md select-none">
                    {product.emoji || "📦"}
                  </span>
                )}

                {/* Badges on image */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold shadow-md ${
                      type === "Free"
                        ? "bg-[#22C55E] text-white"
                        : type === "Exchange"
                        ? "bg-cyan-500 text-white"
                        : "bg-[#A855F7] text-white"
                    }`}
                  >
                    {type === "Free" ? "FREE" : type === "Exchange" ? "EXCHANGE" : "FOR SALE"}
                  </span>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold shadow-md border ${
                      status === "Available"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                        : status === "Reserved"
                        ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                        : "bg-zinc-800 text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {status}
                  </span>

                  {product.isActive === false && (
                    <span className="text-xs px-3 py-1 rounded-full font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40">
                      Deactivated
                    </span>
                  )}
                </div>
              </div>

              {/* Information Section */}
              <div className="p-6 sm:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold bg-[#1E1930] text-[#D8B4FE] border border-[#302641] px-3 py-1 rounded-full">
                      {product.category}
                    </span>
                    <span className="text-xs text-[#A1A1AA] font-medium">
                      Condition: {product.condition}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight leading-snug">
                    {product.name}
                  </h1>

                  <div className="mt-4 mb-6">
                    <p className="text-3xl sm:text-4xl font-black text-[#C084FC]">
                      {type === "Free"
                        ? "FREE"
                        : type === "Exchange"
                        ? "EXCHANGE"
                        : `₹${product.price}`}
                    </p>
                    {type === "Free" && (
                      <p className="text-xs text-emerald-400 font-medium mt-1">
                        Given away for free by a student peer
                      </p>
                    )}
                    {type === "Exchange" && (
                      <p className="text-xs text-cyan-400 font-medium mt-1">
                        Open for mutual trade/exchange
                      </p>
                    )}
                  </div>

                  {/* Attributes list */}
                  <div className="border-t border-b border-[#302641] py-5 my-5 space-y-3.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA] flex items-center gap-2">
                        <Tag size={16} className="text-[#A855F7]" />
                        Category
                      </span>
                      <span className="font-semibold text-[#F8FAFC]">
                        {product.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA] flex items-center gap-2">
                        <Package size={16} className="text-[#A855F7]" />
                        Condition
                      </span>
                      <span className="font-semibold text-[#F8FAFC]">
                        {product.condition}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA] flex items-center gap-2">
                        <MapPin size={16} className="text-[#A855F7]" />
                        Pickup Location
                      </span>
                      <span className="font-semibold text-[#F8FAFC]">
                        {product.location || "Campus Center"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#A1A1AA] flex items-center gap-2">
                        <User size={16} className="text-[#A855F7]" />
                        Seller
                      </span>
                      <Link
                        href={`/seller/${encodeURIComponent(product.seller)}`}
                        className="font-semibold text-[#D8B4FE] hover:text-white hover:underline transition"
                      >
                        {product.seller} →
                      </Link>
                    </div>

                    {product.createdAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-[#A1A1AA] flex items-center gap-2">
                          <Calendar size={16} className="text-[#A855F7]" />
                          Listed Date
                        </span>
                        <span className="font-semibold text-[#F8FAFC]">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="font-bold text-[#A1A1AA] uppercase tracking-wider text-xs mb-2">
                      Description
                    </h3>
                    <p className="text-[#A1A1AA] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Interaction & Action Bar */}
                <div className="space-y-3 pt-4 border-t border-[#302641]">
                  {/* Primary Enquiry Button */}
                  {isAvailable ? (
                    <Link
                      href={`/products/${id}/enquire`}
                      className="flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md shadow-purple-900/30 w-full text-sm"
                    >
                      <Sparkles size={18} />
                      Enquire / Make an Offer
                    </Link>
                  ) : (
                    <div className="w-full text-center py-3.5 px-6 rounded-xl bg-[#100D1B] border border-[#302641] text-[#71717A] font-semibold text-sm">
                      This listing is currently {status.toLowerCase()}
                    </div>
                  )}

                  {/* Direct Contact Button */}
                  <a
                    href={`tel:${product.phone}`}
                    className="flex items-center justify-center gap-2 bg-[#1E1930] hover:bg-[#251f3d] text-[#F8FAFC] font-semibold py-3 px-6 rounded-xl border border-[#302641] transition w-full text-sm"
                  >
                    <Phone size={16} className="text-[#A855F7]" />
                    Call Seller ({product.phone})
                  </a>

                  {/* Edit and Delete Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      href={`/products/${id}/edit`}
                      className="flex items-center justify-center gap-1.5 border border-[#302641] text-[#D8B4FE] hover:bg-[#1E1930] py-2.5 rounded-xl transition text-xs font-semibold"
                    >
                      <Pencil size={14} />
                      Edit Listing
                    </Link>

                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex items-center justify-center gap-1.5 border border-red-500/30 text-red-400 hover:bg-red-950/40 py-2.5 rounded-xl transition text-xs font-semibold disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      {deleting ? "Deleting..." : "Delete Listing"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Products Recommendation */}
          {similarProducts.length > 0 && (
            <section className="mt-16">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#F8FAFC]">
                    Similar Products in {product.category}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
                    Other students also listed these related items
                  </p>
                </div>

                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="text-xs sm:text-sm font-semibold text-[#C084FC] hover:text-white transition"
                >
                  View All in {product.category} →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProducts.map((simProduct) => (
                  <ProductCard
                    key={simProduct._id}
                    product={{
                      ...simProduct,
                      id: simProduct._id,
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* QR Code Share Modal */}
          {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
              <div className="bg-[#171326] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative border border-[#302641]">
                <button
                  onClick={() => setShowQrModal(false)}
                  className="absolute top-4 right-4 p-2 text-[#71717A] hover:text-white rounded-full"
                >
                  <X size={20} />
                </button>

                <div className="w-12 h-12 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <QrCode size={24} />
                </div>

                <h3 className="text-lg font-bold text-[#F8FAFC]">
                  Scan to Open on Campus
                </h3>
                <p className="text-xs text-[#A1A1AA] mt-1 mb-5">
                  Scan this QR code with a phone camera to view this listing instantly.
                </p>

                {/* QR Code Image from public API */}
                <div className="bg-white p-3 rounded-2xl border border-[#302641] inline-block shadow-inner mb-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                      currentUrl
                    )}`}
                    alt="Listing QR Code"
                    className="w-44 h-44 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleCopyShareLink}
                    className="w-full flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold py-3 rounded-xl transition text-xs shadow-md shadow-purple-900/30"
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    {copiedLink ? "Link Copied!" : "Copy Listing Link"}
                  </button>

                  <button
                    onClick={() => setShowQrModal(false)}
                    className="w-full text-xs text-[#A1A1AA] hover:text-white py-2 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090711] flex items-center justify-center">
          <p className="text-[#A855F7] font-semibold">Loading product...</p>
        </div>
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}
