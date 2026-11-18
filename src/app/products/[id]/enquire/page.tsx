"use client";

import { useEffect, useState, type FormEvent, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { IProduct } from "@/types/product";
import { ArrowLeft, Sparkles, Send, CheckCircle2, AlertCircle } from "lucide-react";

function EnquireProductContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const productId = params?.id;

  const [product, setProduct] = useState<IProduct | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  // Initialize with local storage if available
  const [buyerName, setBuyerName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("Picksy-buyer-name") || "";
    }
    return "";
  });
  const [buyerPhone, setBuyerPhone] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("Picksy-buyer-phone") || "";
    }
    return "";
  });
  const [message, setMessage] = useState("");
  const [offerPrice, setOfferPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Load product info
  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      if (!productId) return;
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (res.ok && isMounted) {
          setProduct(data);
        }
      } catch (err) {
        console.error("Failed to load product for enquiry:", err);
      } finally {
        if (isMounted) {
          setProductLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!buyerName.trim() || !buyerPhone.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const cleanPhone = buyerPhone.trim().replace(/\s+/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number (at least 7 to 15 digits).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          buyerName: buyerName.trim(),
          buyerPhone: cleanPhone,
          message: message.trim(),
          offerPrice: offerPrice === "" ? null : Number(offerPrice),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit enquiry");
      }

      // Persist contact details for future ease of use
      try {
        localStorage.setItem("Picksy-buyer-name", buyerName.trim());
        localStorage.setItem("Picksy-buyer-phone", cleanPhone);
      } catch {}

      setSubmitted(true);
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href={`/products/${productId}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#D8B4FE] hover:text-white mb-6 transition"
          >
            <ArrowLeft size={16} />
            Back to Product
          </Link>

          {/* Product Preview Card */}
          {product && (
            <div className="bg-[#171326] rounded-2xl p-4 sm:p-5 border border-[#302641] shadow-sm mb-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-[#100D1B] border border-[#302641] flex items-center justify-center overflow-hidden shrink-0">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">{product.emoji || "📦"}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold bg-[#1E1930] text-[#D8B4FE] border border-[#302641] px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
                <h2 className="text-base font-bold text-[#F8FAFC] truncate mt-1">
                  {product.name}
                </h2>
                <p className="text-xs text-[#A1A1AA]">
                  Seller: <span className="font-medium text-[#F8FAFC]">{product.seller}</span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg font-black text-[#C084FC]">
                  {product.listingType === "Free"
                    ? "FREE"
                    : product.listingType === "Exchange"
                    ? "EXCHANGE"
                    : `₹${product.price}`}
                </p>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="bg-[#171326] rounded-3xl p-8 sm:p-10 border border-[#302641] text-center shadow-xl">
              <div className="bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl font-bold text-[#F8FAFC]">
                Enquiry Sent Successfully!
              </h2>

              <p className="text-[#A1A1AA] text-sm mt-3 max-w-md mx-auto leading-relaxed">
                The seller has been notified with your message and contact details. You can track this conversation in the Enquiries page.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link
                  href="/enquiries"
                  className="bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-purple-900/30 text-sm"
                >
                  View My Enquiries
                </Link>

                <Link
                  href="/products"
                  className="bg-[#100D1B] hover:bg-[#1E1930] border border-[#302641] text-[#D8B4FE] font-semibold px-6 py-3 rounded-xl transition text-sm"
                >
                  Continue Browsing
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#171326] rounded-3xl p-6 sm:p-8 border border-[#302641] shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-xl">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#F8FAFC]">
                    Send an Enquiry
                  </h1>
                  <p className="text-xs sm:text-sm text-[#A1A1AA]">
                    Connect directly with the student selling this item.
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-950/40 text-red-200 p-4 rounded-xl text-sm my-5 border border-red-500/50">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Your Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    required
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  />
                  <p className="text-[11px] text-[#71717A] mt-1">
                    The seller will use this number to contact you.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Offer Price (₹) - Optional
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    placeholder={
                      product?.price
                        ? `Suggested price: ₹${product.price}`
                        : "Enter your counter-offer"
                    }
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  />
                  <p className="text-[11px] text-[#71717A] mt-1">
                    Leave blank if you agree with the listed price.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Message to Seller *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Hi! I am interested in this item. When and where can we meet on campus?"
                    required
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || productLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-sm shadow-md shadow-purple-900/30"
                  >
                    <Send size={16} />
                    {loading ? "Sending Enquiry..." : "Send Enquiry to Seller"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-full text-center text-xs text-[#71717A] hover:text-[#A1A1AA] py-3 mt-2 transition"
                  >
                    Cancel and go back
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function EnquirePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090711] flex items-center justify-center">
          <p className="text-[#A855F7] font-semibold">Loading enquiry form...</p>
        </div>
      }
    >
      <EnquireProductContent />
    </Suspense>
  );
}
