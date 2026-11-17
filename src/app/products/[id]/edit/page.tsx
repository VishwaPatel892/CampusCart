"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Upload, Check, AlertCircle, Sparkles } from "lucide-react";

function EditProductContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Books & Study Materials",
    condition: "Good",
    emoji: "📦",
    image: "",
    seller: "",
    description: "",
    phone: "",
    location: "Campus",
    listingType: "For Sale",
    status: "Available",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get existing product information
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
          setForm({
            name: data.name || "",
            price: String(data.price ?? ""),
            category: data.category || "Books & Study Materials",
            condition: data.condition || "Good",
            emoji: data.emoji || "📦",
            image: data.image || "",
            seller: data.seller || "",
            description: data.description || "",
            phone: data.phone || "",
            location: data.location || "Campus",
            listingType: data.listingType || "For Sale",
            status: data.status || "Available",
            isActive: data.isActive !== false,
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load product"
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

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
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

      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload image."
      );
    } finally {
      setUploading(false);
    }
  }

  // Save updated product
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const productPrice =
        form.listingType === "Free" ? 0 : Number(form.price);

      if (form.listingType === "For Sale" && (!productPrice || productPrice <= 0)) {
        throw new Error("Please specify a valid price for items For Sale.");
      }

      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          price: productPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      setSuccess("Product updated successfully! Redirecting...");
      setTimeout(() => {
        router.push(`/products/${id}`);
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090711] flex flex-col justify-between">
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#A855F7] border-t-transparent mb-3" />
          <p className="text-[#A1A1AA] text-sm">Loading product for editing...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <Link
            href={`/products/${id}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#D8B4FE] hover:text-white mb-6 transition"
          >
            <ArrowLeft size={16} />
            Back to Details
          </Link>

          <div className="bg-[#171326] rounded-3xl p-6 sm:p-8 border border-[#302641] shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-[#1E1930] text-[#A855F7] border border-[#302641] rounded-xl">
                <Sparkles size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F8FAFC]">
                  Edit Product Listing
                </h1>
                <p className="text-xs sm:text-sm text-[#A1A1AA]">
                  Update information, change availability status, or upload a new photo.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-950/40 text-red-200 p-4 rounded-xl text-sm my-6 border border-red-500/50">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 bg-emerald-950/40 text-emerald-300 p-4 rounded-xl text-sm my-6 border border-emerald-500/50">
                <Check size={18} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Product Name *
                </label>
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                />
              </div>

              {/* Listing Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Listing Type
                  </label>
                  <select
                    name="listingType"
                    value={form.listingType}
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value === "Free") {
                        setForm((prev) => ({ ...prev, listingType: "Free", price: "0" }));
                      }
                    }}
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#A855F7]"
                  >
                    <option value="For Sale" className="bg-[#100D1B] text-[#F8FAFC]">For Sale</option>
                    <option value="Free" className="bg-[#100D1B] text-[#F8FAFC]">Free</option>
                    <option value="Exchange" className="bg-[#100D1B] text-[#F8FAFC]">Exchange</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#A855F7]"
                  >
                    <option value="Available" className="bg-[#100D1B] text-[#F8FAFC]">Available</option>
                    <option value="Reserved" className="bg-[#100D1B] text-[#F8FAFC]">Reserved</option>
                    <option value="Sold" className="bg-[#100D1B] text-[#F8FAFC]">Sold</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Price (₹) {form.listingType === "Free" && "(Free item)"}
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.listingType === "Free" ? "0" : form.price}
                  onChange={handleChange}
                  disabled={form.listingType === "Free"}
                  required={form.listingType === "For Sale"}
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] disabled:opacity-50 focus:outline-none focus:border-[#A855F7]"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
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
                    Condition
                  </label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
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

              {/* Campus Location / Meeting Spot */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Campus Pickup Spot
                </label>
                <input
                  name="location"
                  type="text"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Central Library, Hostel 4 Gate, Nescafe Canteen"
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                />
              </div>

              {/* Image Upload / Emoji */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Product Image
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
                    className="inline-flex items-center gap-2 bg-[#1E1930] hover:bg-[#251f3d] border border-[#302641] hover:border-[#A855F7] px-4 py-2.5 rounded-xl text-xs font-semibold text-[#D8B4FE] transition"
                  >
                    <Upload size={16} className="text-[#A855F7]" />
                    {uploading ? "Uploading..." : form.image ? "Change Photo" : "Upload Photo"}
                  </button>

                  {form.image && (
                    <span className="text-xs text-emerald-400 font-medium truncate max-w-[200px]">
                      Photo attached
                    </span>
                  )}
                </div>

                {form.image && (
                  <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-[#302641]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.image}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
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
                  Product Emoji (Fallback icon)
                </label>
                <input
                  name="emoji"
                  type="text"
                  value={form.emoji}
                  onChange={handleChange}
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                />
              </div>

              {/* Seller Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Seller Name *
                  </label>
                  <input
                    name="seller"
                    type="text"
                    value={form.seller}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#100D1B] border border-[#302641] rounded-xl p-3 text-sm text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7]"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded-md accent-[#A855F7] bg-[#100D1B] border-[#302641]"
                  />
                  <span className="text-sm font-medium text-[#F8FAFC]">
                    Listing is Active (uncheck to temporarily deactivate)
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-sm shadow-md shadow-purple-900/30"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-[#100D1B] hover:bg-[#1E1930] border border-[#302641] text-[#A1A1AA] hover:text-white font-semibold px-6 py-3.5 rounded-xl transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090711] flex items-center justify-center">
          <p className="text-[#A855F7] font-semibold">Loading product editor...</p>
        </div>
      }
    >
      <EditProductContent />
    </Suspense>
  );
}
