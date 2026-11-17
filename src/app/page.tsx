import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import type { IProduct } from "@/types/product";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  ShieldCheck,
  Tag,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  BookOpen,
  Laptop,
  Armchair,
  PenTool,
  Watch,
  Trophy,
  PackageCheck,
} from "lucide-react";

// Server component that fetches latest available products from MongoDB
async function LatestProducts() {
  await connection();

  let products: Array<{
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
  }> = [];

  try {
    await connectDB();

    const result = await Product.find({
      isActive: { $ne: false },
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    products = (result as unknown as IProduct[]).map((product) => ({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      category: product.category,
      condition: product.condition,
      emoji: product.emoji || "📦",
      image: product.image || "",
      seller: product.seller,
      description: product.description,
      listingType: product.listingType || "For Sale",
      status: product.status || "Available",
      isActive: product.isActive !== false,
      location: product.location || "Campus",
    }));
  } catch (error) {
    console.error("Failed to load products on homepage:", error);
  }

  return (
    <>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-[#171326] rounded-2xl p-12 text-center border border-[#302641]">
          <p className="text-6xl mb-4">📦</p>

          <h3 className="text-2xl font-bold text-[#F8FAFC]">
            No Products Available Yet
          </h3>

          <p className="text-[#A1A1AA] mt-2 max-w-md mx-auto text-sm">
            Be the pioneer on your campus! List your unused textbooks, electronics, or dorm essentials today.
          </p>

          <Link
            href="/sell"
            className="inline-flex items-center gap-2 bg-[#A855F7] text-white font-semibold px-6 py-3 rounded-xl mt-6 hover:bg-[#9333EA] transition shadow-md shadow-purple-900/30 text-sm"
          >
            Sell Your First Item
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </>
  );
}

// Loading Skeleton
function ProductsLoading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-[#171326] rounded-2xl p-5 border border-[#302641] animate-pulse space-y-4"
        >
          <div className="h-44 bg-[#1E1930] rounded-xl" />
          <div className="h-5 bg-[#1E1930] rounded w-3/4" />
          <div className="h-4 bg-[#1E1930] rounded w-1/2" />
          <div className="h-6 bg-[#1E1930] rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const categories = [
    {
      name: "Books & Study Materials",
      displayName: "Books & Notes",
      icon: BookOpen,
      desc: "Textbooks, Gate/CAT notes & guides",
      color: "from-blue-500/20 to-purple-500/20 text-blue-400 border-blue-500/30",
    },
    {
      name: "Electronics",
      displayName: "Electronics",
      icon: Laptop,
      desc: "Calculators, tablets & laptops",
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
    {
      name: "Furniture",
      displayName: "Furniture",
      icon: Armchair,
      desc: "Study tables, chairs & mattresses",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      name: "Stationery",
      displayName: "Stationery",
      icon: PenTool,
      desc: "Drafters, sheet holders & kits",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      name: "Accessories",
      displayName: "Accessories",
      icon: Watch,
      desc: "Bags, headphones & chargers",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      name: "Sports Equipment",
      displayName: "Sports & Fitness",
      icon: Trophy,
      desc: "Badminton, gym gear & cycles",
      color: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30",
    },
  ];

  const workflowSteps = [
    {
      number: "01",
      title: "Discover Campus Deals",
      desc: "Search hundreds of verified listings from students right inside your college hostels and academic blocks.",
      icon: Search,
    },
    {
      number: "02",
      title: "Send Offer & Negotiate",
      desc: "Enquire directly with the seller and propose fair offer prices with zero middlemen or payment gateway cuts.",
      icon: Sparkles,
    },
    {
      number: "03",
      title: "Meet & Handover",
      desc: "Inspect items in person at familiar spots like the central library, college canteen, or student hostel gate.",
      icon: PackageCheck,
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: "100% Student Verified",
      desc: "Direct peer-to-peer campus trades with real student profiles and safe meeting spots.",
    },
    {
      icon: Tag,
      title: "Fair Student Pricing",
      desc: "Save up to 70% compared to new prices, or claim 100% free giveaways from senior graduates.",
    },
    {
      icon: RefreshCw,
      title: "Sustainable Campus Life",
      desc: "Keep books and study equipment circulating across batches, reducing waste every semester.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 px-5 sm:px-8 border-b border-[#302641]">
          {/* Subtle Ambient Glowing Background Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-purple-600/15 via-purple-900/10 to-transparent blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 bg-[#A855F7]/10 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#9333EA]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#171326] border border-[#A855F7]/40 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-semibold text-[#D8B4FE] shadow-sm shadow-purple-950/50">
              <Sparkles size={14} className="text-[#A855F7] animate-pulse" />
              <span>The #1 Verified Student Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#F8FAFC] tracking-tight leading-[1.15]">
              Your Campus. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C084FC] via-[#A855F7] to-[#D8B4FE]">
                Your Marketplace.
              </span>
            </h1>

            <p className="text-[#A1A1AA] mt-5 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Buy, sell, and exchange everything you need for college. Discover affordable textbooks, electronics, and dorm essentials from students around your campus.
            </p>

            {/* Hero Search Bar */}
            <form
              action="/products"
              method="GET"
              className="mt-8 max-w-xl mx-auto flex items-center bg-[#171326] border border-[#302641] hover:border-[#A855F7]/60 focus-within:border-[#A855F7] rounded-2xl p-1.5 shadow-xl transition"
            >
              <div className="pl-3.5 pr-2 text-[#A855F7]">
                <Search size={20} />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search engineering books, scientific calculators, cycles..."
                className="w-full bg-transparent text-[#F8FAFC] placeholder-[#71717A] text-sm sm:text-base outline-none px-2 py-2"
              />
              <button
                type="submit"
                className="bg-[#A855F7] hover:bg-[#9333EA] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shrink-0 shadow-md shadow-purple-900/30 flex items-center gap-1.5"
              >
                <span>Search</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-7 py-3.5 rounded-xl transition shadow-lg shadow-purple-900/40 text-sm"
              >
                Explore Marketplace
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-[#171326] hover:bg-[#1E1930] text-[#D8B4FE] font-semibold px-7 py-3.5 rounded-xl border border-[#302641] hover:border-[#A855F7]/60 transition text-sm shadow-sm"
              >
                <Zap size={16} className="text-[#A855F7]" />
                + Post a Free Listing
              </Link>
            </div>

            {/* Real Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 pt-8 border-t border-[#302641]/70">
              <div className="p-3 bg-[#100D1B] rounded-xl border border-[#302641]/60">
                <div className="text-2xl font-black text-[#A855F7]">25+</div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">Active Campus Deals</div>
              </div>
              <div className="p-3 bg-[#100D1B] rounded-xl border border-[#302641]/60">
                <div className="text-2xl font-black text-[#C084FC]">₹0 Fees</div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">Zero Commissions</div>
              </div>
              <div className="p-3 bg-[#100D1B] rounded-xl border border-[#302641]/60">
                <div className="text-2xl font-black text-[#22C55E]">100% Free</div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">Giveaways Supported</div>
              </div>
              <div className="p-3 bg-[#100D1B] rounded-xl border border-[#302641]/60">
                <div className="text-2xl font-black text-[#D8B4FE]">Direct</div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">Hostel & Block Handover</div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A855F7]">
                Quick Discovery
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-1">
                Explore by Category
              </h2>
              <p className="text-sm text-[#A1A1AA] mt-1">
                Find exactly what you need for this semester
              </p>
            </div>

            <Link
              href="/products"
              className="text-xs sm:text-sm font-semibold text-[#C084FC] hover:text-white flex items-center gap-1 transition"
            >
              All Categories <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              return (
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  key={cat.name}
                  className="bg-[#171326] rounded-2xl p-5 text-center border border-[#302641] hover:border-[#A855F7] hover:bg-[#1E1930] hover:shadow-lg hover:shadow-purple-950/40 transition group"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#100D1B] border border-[#302641] flex items-center justify-center text-[#A855F7] group-hover:scale-110 group-hover:border-[#A855F7] transition duration-200">
                    <IconComp size={22} />
                  </div>

                  <h3 className="font-bold text-[#F8FAFC] mt-3.5 text-xs sm:text-sm group-hover:text-[#C084FC] transition">
                    {cat.displayName}
                  </h3>

                  <p className="text-[11px] text-[#71717A] mt-1 line-clamp-1 group-hover:text-[#A1A1AA] transition">
                    {cat.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Latest Products Section */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 pb-20">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-3 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#A855F7]">
                Fresh on Campus
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] mt-1">
                Recently Added Items
              </h2>
              <p className="text-sm text-[#A1A1AA] mt-1">
                Browse latest textbooks, gadgets, and supplies posted by fellow students
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#C084FC] hover:text-white transition"
            >
              View All Marketplace Products
              <ArrowRight size={14} />
            </Link>
          </div>

          <Suspense fallback={<ProductsLoading />}>
            <LatestProducts />
          </Suspense>
        </section>

        {/* How CampusCart Works */}
        <section className="bg-[#100D1B] border-y border-[#302641] py-20 px-5 sm:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A855F7]">
                Simple & Frictionless
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-2">
                How CampusCart Works
              </h2>
              <p className="text-sm sm:text-base text-[#A1A1AA] mt-3">
                No complex shipping, no commission cuts. Straightforward student-to-student transactions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workflowSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="relative bg-[#171326] rounded-2xl p-7 border border-[#302641] hover:border-[#A855F7]/50 transition group shadow-md"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#1E1930] border border-[#302641] flex items-center justify-center text-[#A855F7] group-hover:scale-105 transition">
                        <Icon size={22} />
                      </div>
                      <span className="text-2xl font-black text-[#302641] group-hover:text-[#A855F7]/40 transition">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#F8FAFC] group-hover:text-[#D8B4FE] transition">
                      {step.title}
                    </h3>

                    <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Students Choose CampusCart */}
        <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#A855F7]">
              Built For Campus Life
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] mt-2">
              Why Students Choose CampusCart
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="bg-[#171326] rounded-2xl p-7 border border-[#302641] flex items-start gap-4 hover:border-[#A855F7]/50 transition shadow-sm"
              >
                <div className="bg-[#1E1930] p-3 rounded-xl text-[#A855F7] shrink-0 border border-[#302641]">
                  <feat.icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#F8FAFC] text-base">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
          <div className="relative overflow-hidden bg-gradient-to-r from-[#171326] via-[#1E1930] to-[#171326] rounded-3xl p-8 sm:p-12 border border-[#A855F7]/40 text-center shadow-2xl shadow-purple-950/40">
            <div className="absolute top-0 right-1/4 w-60 h-60 bg-[#A855F7]/15 rounded-full blur-3xl pointer-events-none" />

            <span className="inline-block bg-[#A855F7]/20 text-[#D8B4FE] border border-[#A855F7]/30 text-xs font-semibold px-3.5 py-1 rounded-full mb-4">
              Clear Your Room. Help a Junior.
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              Have Something You Don&apos;t Need Anymore?
            </h2>

            <p className="text-sm sm:text-base text-[#A1A1AA] mt-3 max-w-xl mx-auto">
              Post an item in under 60 seconds with photos and pickup details. Connect directly with buyers around campus.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-8 py-3.5 rounded-xl transition shadow-lg shadow-purple-900/40 text-sm"
              >
                Start Selling Today
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-[#100D1B] hover:bg-[#1E1930] text-[#D8B4FE] font-semibold px-6 py-3.5 rounded-xl border border-[#302641] transition text-sm"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
