"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  PackagePlus,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MapPin,
  Wand2,
} from "lucide-react";

export default function SellPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books & Study Materials");
  const [condition, setCondition] = useState("Good");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("Campus Main Library Quad");
  const [seller, setSeller] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("campuscart-seller-name") || "";
    }
    return "";
  });
  const [phone, setPhone] = useState("");
  const [listingType, setListingType] = useState("For Sale");
  const [emoji, setEmoji] = useState("📚");
  const [image, setImage] = useState("");

  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category emoji suggestions
  function handleCategoryChange(cat: string) {
    setCategory(cat);
    const emojiMap: Record<string, string> = {
      "Books & Study Materials": "📚",
      Books: "📚",
      Electronics: "💻",
      Furniture: "🪑",
      Stationery: "✏️",
      Accessories: "🎒",
      "Sports Equipment": "🏸",
      Others: "✨",
    };
    if (emojiMap[cat]) {
      setEmoji(emojiMap[cat]);
    }
  }

  // AI-Assisted Category Suggestion when title is typed
  function handleNameChange(newName: string) {
    setName(newName);
    const lower = newName.toLowerCase();

    if (
      lower.includes("book") ||
      lower.includes("novel") ||
      lower.includes("guide") ||
      lower.includes("calculus") ||
      lower.includes("physics") ||
      lower.includes("chemistry") ||
      lower.includes("notes")
    ) {
      handleCategoryChange("Books & Study Materials");
    } else if (
      lower.includes("calculator") ||
      lower.includes("laptop") ||
      lower.includes("phone") ||
      lower.includes("headphone") ||
      lower.includes("charger") ||
      lower.includes("monitor") ||
      lower.includes("mouse") ||
      lower.includes("keyboard")
    ) {
      handleCategoryChange("Electronics");
    } else if (
      lower.includes("chair") ||
      lower.includes("desk") ||
      lower.includes("table") ||
      lower.includes("lamp") ||
      lower.includes("mattress") ||
      lower.includes("cushion")
    ) {
      handleCategoryChange("Furniture");
    } else if (
      lower.includes("notebook") ||
      lower.includes("pen") ||
      lower.includes("pencil") ||
      lower.includes("sheet") ||
      lower.includes("drafter") ||
      lower.includes("roller") ||
      lower.includes("scale")
    ) {
      handleCategoryChange("Stationery");
    } else if (
      lower.includes("bag") ||
      lower.includes("backpack") ||
      lower.includes("bottle") ||
      lower.includes("watch") ||
      lower.includes("umbrella") ||
      lower.includes("lock")
    ) {
      handleCategoryChange("Accessories");
    } else if (
      lower.includes("bat") ||
      lower.includes("racket") ||
      lower.includes("ball") ||
      lower.includes("cycle") ||
      lower.includes("badminton") ||
      lower.includes("dumbbell") ||
      lower.includes("yoga")
    ) {
      handleCategoryChange("Sports Equipment");
    }
  }

  // AI-Generated Description from item details
  function generateAiDescription() {
    if (!name.trim()) {
      setError("Please enter a product title first so the AI can craft a description.");
      return;
    }

    setAiGenerating(true);
    setError("");

    setTimeout(() => {
      const conditionMap: Record<string, string> = {
        New: "Brand new and completely unused in original wrapping.",
        "Like New": "Gently used for only a few weeks with practically zero signs of wear.",
        Good: "Carefully handled with standard signs of semester usage. Fully functional with all parts intact.",
        Fair: "Well-utilized through multiple terms, but completely intact and reliable.",
        Used: "Honest pre-owned student gear that works as expected.",
      };

      const condDetail = conditionMap[condition] || "Maintained in clean working condition.";
      const typeDetail =
        listingType === "Free"
          ? "Giving this away 100% free to support junior students on campus!"
          : listingType === "Exchange"
          ? "Open to mutual exchange with other useful student gear or textbooks."
          : `Offered at a pocket-friendly student price of ₹${price || "reasonable value"}.`;

      const generated = `Pre-owned ${name.trim()} ready for campus use. ${condDetail} Ideal for students who want quality supplies without paying retail bookstore prices. ${typeDetail}\n\nAvailable for quick in-person pickup and inspection at ${location}. Drop a message or make an offer to coordinate!`;

      setDescription(generated);
      setAiGenerating(false);
    }, 400);
  }

  // Handle image upload
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image.");
      }

      setImage(data.url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim() || !seller.trim() || !phone.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
      setError("Please enter a valid phone number (at least 7 to 15 digits).");
      return;
    }

    const productPrice = listingType === "Free" ? 0 : Number(price || 0);

    if (listingType === "For Sale" && (!productPrice || productPrice <= 0)) {
      setError("Please enter a valid price for items listed for sale.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          price: productPrice,
          category,
          condition,
          emoji: emoji || "📦",
          image,
          description: description.trim(),
          location: location.trim(),
          seller: seller.trim(),
          phone: cleanPhone,
          listingType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product");
      }

      // Save seller name locally for dashboard convenience
      try {
        localStorage.setItem("campuscart-seller-name", seller.trim());
      } catch {}

      setCreatedProductId(data.product?._id || null);
      setMessage("Product added successfully!");

      // Clear inputs
      setName("");
      setPrice("");
      setDescription("");
      setImage("");
    } catch (err) {
      console.error("Submit error:", err);
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

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-950/40">
              <PackagePlus size={30} />
            </div>

            <h1 className="text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              List an Item for Campus
            </h1>

            <p className="text-sm text-[#A1A1AA] mt-2 max-w-md mx-auto">
              Give your unused textbooks, gadgets, and dorm supplies a new home. Fast, free, and campus-friendly.
            </p>
          </div>

          {createdProductId ? (
            <div className="bg-[#171326] rounded-3xl p-8 sm:p-10 border border-[#302641] text-center shadow-xl">
              <div className="w-16 h-16 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>

              <h2 className="text-2xl font-bold text-[#F8FAFC]">
                Your Listing is Live!
              </h2>

              <p className="text-[#A1A1AA] text-sm mt-2 max-w-md mx-auto">
                Other students can now view your listing, save it to favorites, or send you enquiries.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link
                  href={`/products/${createdProductId}`}
                  className="inline-flex items-center justify-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-purple-900/30 text-sm"
                >
                  View Product Page
                  <ArrowRight size={16} />
                </Link>

                <button
                  onClick={() => setCreatedProductId(null)}
                  className="bg-[#100D1B] hover:bg-[#1E1930] border border-[#302641] text-[#D8B4FE] font-semibold px-6 py-3 rounded-xl transition text-sm"
                >
                  List Another Item
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-[#171326] p-6 sm:p-8 rounded-3xl border border-[#302641] shadow-xl space-y-6"
            >
              {error && (
                <div className="flex items-center gap-2 bg-red-950/40 text-red-200 p-4 rounded-xl text-sm border border-red-500/50">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {message && (
                <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-300 p-4 rounded-xl text-sm border border-emerald-500/50">
                  <CheckCircle2 size={18} className="shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Product Name */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#A1A1AA]">
                    Product Name *
                  </label>
                  <span className="text-[11px] text-[#D8B4FE] flex items-center gap-1 font-medium">
                    <Sparkles size={12} className="text-[#A855F7]" /> Auto-suggests category
                  </span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Engineering Mathematics Volume 1, Casio fx-991EX..."
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  required
                />
              </div>

              {/* Listing Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Listing Type *
                  </label>
                  <select
                    value={listingType}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setListingType(newType);
                      if (newType === "Free") {
                        setPrice("0");
                      } else if (price === "0") {
                        setPrice("");
                      }
                    }}
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#A855F7]"
                  >
                    <option value="For Sale" className="bg-[#100D1B] text-[#F8FAFC]">For Sale</option>
                    <option value="Free" className="bg-[#100D1B] text-[#F8FAFC]">Free (Giveaway)</option>
                    <option value="Exchange" className="bg-[#100D1B] text-[#F8FAFC]">Exchange (Barter)</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Price (₹) {listingType === "Free" ? "(FREE)" : "*"}
                  </label>
                  <input
                    type="number"
                    value={listingType === "Free" ? "0" : price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price in ₹"
                    min="0"
                    disabled={listingType === "Free"}
                    required={listingType === "For Sale"}
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] disabled:opacity-50 focus:outline-none focus:border-[#A855F7]"
                  />
                  {listingType === "Exchange" && (
                    <p className="text-[11px] text-[#71717A] mt-1">
                      Set 0 or estimated item value for exchange reference.
                    </p>
                  )}
                </div>
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#A855F7]"
                  >
                    <option value="Books & Study Materials" className="bg-[#100D1B] text-[#F8FAFC]">Books & Study Materials</option>
                    <option value="Electronics" className="bg-[#100D1B] text-[#F8FAFC]">Electronics</option>
                    <option value="Furniture" className="bg-[#100D1B] text-[#F8FAFC]">Furniture</option>
                    <option value="Stationery" className="bg-[#100D1B] text-[#F8FAFC]">Stationery</option>
                    <option value="Accessories" className="bg-[#100D1B] text-[#F8FAFC]">Accessories</option>
                    <option value="Sports Equipment" className="bg-[#100D1B] text-[#F8FAFC]">Sports Equipment</option>
                    <option value="Others" className="bg-[#100D1B] text-[#F8FAFC]">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#A855F7]"
                  >
                    <option value="New" className="bg-[#100D1B] text-[#F8FAFC]">New</option>
                    <option value="Like New" className="bg-[#100D1B] text-[#F8FAFC]">Like New</option>
                    <option value="Good" className="bg-[#100D1B] text-[#F8FAFC]">Good</option>
                    <option value="Fair" className="bg-[#100D1B] text-[#F8FAFC]">Fair</option>
                    <option value="Used" className="bg-[#100D1B] text-[#F8FAFC]">Used</option>
                  </select>
                </div>
              </div>

              {/* Campus Location / Pickup Spot */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#A855F7]" />
                  Campus Location / Preferred Pickup Spot
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#A855F7]"
                >
                  <option value="Campus Main Library Quad" className="bg-[#100D1B] text-[#F8FAFC]">Campus Main Library Quad</option>
                  <option value="Central Cafeteria / Canteen" className="bg-[#100D1B] text-[#F8FAFC]">Central Cafeteria / Canteen</option>
                  <option value="Hostel Block A / Dorms" className="bg-[#100D1B] text-[#F8FAFC]">Hostel Block A / Dormitories</option>
                  <option value="Engineering Quad" className="bg-[#100D1B] text-[#F8FAFC]">Engineering Building Quad</option>
                  <option value="Student Activity Center" className="bg-[#100D1B] text-[#F8FAFC]">Student Activity Center (SAC)</option>
                  <option value="Campus Sports Complex" className="bg-[#100D1B] text-[#F8FAFC]">Campus Sports Complex</option>
                </select>
              </div>

              {/* Product Photo Upload */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Product Photo (Optional, recommended)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 bg-[#1E1930] hover:bg-[#251f3d] border border-[#302641] hover:border-[#A855F7] text-[#D8B4FE] px-4 py-2.5 rounded-xl text-xs font-semibold transition"
                  >
                    <Upload size={16} className="text-[#A855F7]" />
                    {uploading
                      ? "Uploading image..."
                      : image
                        ? "Change Photo"
                        : "Upload Image from Device"}
                  </button>

                  {image && (
                    <span className="text-xs text-emerald-400 font-medium">
                      ✓ Image ready
                    </span>
                  )}
                </div>

                {image && (
                  <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-[#302641]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="Upload preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[10px] w-4 h-4 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Emoji Fallback */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Fallback Emoji Icon
                </label>
                <input
                  type="text"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  placeholder="📦"
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                />
              </div>

              {/* Description + AI Generator Button */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#A1A1AA]">
                    Description *
                  </label>

                  <button
                    type="button"
                    onClick={generateAiDescription}
                    disabled={aiGenerating}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D8B4FE] hover:text-white bg-[#1E1930] hover:bg-[#251f3d] border border-[#A855F7]/30 px-3 py-1 rounded-lg transition"
                  >
                    <Wand2 size={13} className="text-[#A855F7]" />
                    {aiGenerating ? "Generating..." : "✨ AI Auto-Generate"}
                  </button>
                </div>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item: edition, scratches, usage duration, campus pickup spots... Or click 'AI Auto-Generate' above!"
                  rows={4}
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  required
                />
              </div>

              {/* Seller Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Your Name (Seller) *
                  </label>
                  <input
                    type="text"
                    value={seller}
                    onChange={(e) => setSeller(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Contact Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                    required
                  />
                </div>
              </div>

              {/* Status Note */}
              <div className="bg-[#100D1B] border border-[#302641] rounded-2xl p-4 text-xs text-[#A1A1AA] leading-relaxed">
                <strong className="text-[#F8FAFC]">CampusCart Policy:</strong> Your product will start as{" "}
                <span className="font-semibold text-emerald-400">Available</span>. You can mark it as Reserved or Sold from your Seller Dashboard at any time.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || uploading}
                className="w-full bg-[#A855F7] hover:bg-[#9333EA] text-white py-4 rounded-xl font-bold transition disabled:opacity-50 text-sm shadow-md shadow-purple-900/30"
              >
                {loading ? "Publishing Listing..." : "Publish Product Listing"}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
