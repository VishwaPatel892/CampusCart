"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import type { IProduct } from "@/types/product";
import { Filter, SlidersHorizontal, RotateCcw, Sparkles } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  const initialType = searchParams.get("type") || "All";

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [listingType, setListingType] = useState(initialType);
  const [condition, setCondition] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [hideSold, setHideSold] = useState(true);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const categories = [
    "All",
    "Books & Study Materials",
    "Electronics",
    "Furniture",
    "Stationery",
    "Accessories",
    "Sports Equipment",
    "Others",
  ];

  const conditions = ["All", "New", "Like New", "Good", "Fair", "Used"];

  const listingTypes = ["All", "For Sale", "Free", "Exchange"];

  // Fetch products from MongoDB
  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch("/api/products");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch products");
        }

        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load products"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update category / search if query param changes
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat && cat !== category) {
      const timer = setTimeout(() => setCategory(cat), 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, category]);

  useEffect(() => {
    const s = searchParams.get("search");
    if (s !== null && s !== search) {
      const timer = setTimeout(() => setSearch(s), 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams, search]);

  // Apply all filters and sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search by product name or description
    if (search.trim()) {
      const searchText = search.toLowerCase();
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(searchText) ||
          product.description.toLowerCase().includes(searchText)
      );
    }

    // Category filter
    if (category !== "All") {
      result = result.filter((product) => {
        if (category === "Books & Study Materials" || category === "Books") {
          return (
            product.category === "Books & Study Materials" ||
            product.category === "Books"
          );
        }
        return product.category === category;
      });
    }

    // Listing type filter
    if (listingType !== "All") {
      result = result.filter((product) => product.listingType === listingType);
    }

    // Condition filter
    if (condition !== "All") {
      result = result.filter((product) => product.condition === condition);
    }

    // Minimum price filter
    if (minPrice !== "") {
      const minimum = Number(minPrice);
      if (Number.isFinite(minimum)) {
        result = result.filter((product) => product.price >= minimum);
      }
    }

    // Maximum price filter
    if (maxPrice !== "") {
      const maximum = Number(maxPrice);
      if (Number.isFinite(maximum)) {
        result = result.filter((product) => product.price <= maximum);
      }
    }

    // Hide sold products
    if (hideSold) {
      result = result.filter((product) => product.status !== "Sold");
    }

    // Sorting
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    } else if (sortBy === "lowToHigh") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "highToLow") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "relevance" && search.trim()) {
      const term = search.toLowerCase();
      result.sort((a, b) => {
        const aName = a.name.toLowerCase().includes(term) ? 2 : 0;
        const bName = b.name.toLowerCase().includes(term) ? 2 : 0;
        const aDesc = a.description.toLowerCase().includes(term) ? 1 : 0;
        const bDesc = b.description.toLowerCase().includes(term) ? 1 : 0;
        return bName + bDesc - (aName + aDesc);
      });
    }

    return result;
  }, [
    products,
    search,
    category,
    listingType,
    condition,
    minPrice,
    maxPrice,
    sortBy,
    hideSold,
  ]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setListingType("All");
    setCondition("All");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setHideSold(true);
  }

  return (
    <div className="min-h-screen bg-[#090711] text-[#F8FAFC] flex flex-col justify-between selection:bg-[#A855F7]/30 selection:text-white">
      <div>
        <Navbar />

        {/* Page Banner */}
        <section className="relative overflow-hidden bg-[#100D1B] border-b border-[#302641] px-5 py-12 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-[#A855F7]/15 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-[#171326] border border-[#A855F7]/40 px-3.5 py-1 rounded-full text-xs font-semibold text-[#D8B4FE] mb-3">
              <Sparkles size={13} className="text-[#A855F7]" />
              <span>Campus Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#F8FAFC]">
              Campus Marketplace
            </h1>
            <p className="text-[#A1A1AA] mt-2 text-sm sm:text-base max-w-xl mx-auto">
              Browse, filter, and discover books, equipment, and accessories sold by fellow students.
            </p>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Search Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:max-w-xl">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search products by name or description..."
                onClear={() => setSearch("")}
              />
            </div>

            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden w-full flex items-center justify-center gap-2 bg-[#171326] border border-[#302641] py-3 rounded-xl font-semibold text-[#F8FAFC] shadow-sm hover:border-[#A855F7] transition"
            >
              <SlidersHorizontal size={18} className="text-[#A855F7]" />
              {showFiltersMobile ? "Hide Filters" : "Filter Products"}
            </button>
          </div>

          {/* Filter Panel */}
          <div
            className={`bg-[#171326] rounded-2xl border border-[#302641] p-5 mb-8 shadow-lg ${
              showFiltersMobile ? "block" : "hidden sm:block"
            }`}
          >
            <div className="flex flex-wrap justify-between items-center gap-3 pb-4 mb-5 border-b border-[#302641]">
              <div className="flex items-center gap-2 text-[#F8FAFC] font-bold">
                <Filter size={18} className="text-[#A855F7]" />
                <span>Filters & Sorting</span>
              </div>

              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-[#C084FC] hover:text-white font-semibold transition"
              >
                <RotateCcw size={14} />
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-[#302641] rounded-xl p-2.5 text-sm bg-[#100D1B] text-[#F8FAFC] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition"
                >
                  {categories.map((item) => (
                    <option key={item} value={item} className="bg-[#100D1B] text-[#F8FAFC]">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Listing Type */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Listing Type
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full border border-[#302641] rounded-xl p-2.5 text-sm bg-[#100D1B] text-[#F8FAFC] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition"
                >
                  {listingTypes.map((item) => (
                    <option key={item} value={item} className="bg-[#100D1B] text-[#F8FAFC]">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full border border-[#302641] rounded-xl p-2.5 text-sm bg-[#100D1B] text-[#F8FAFC] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition"
                >
                  {conditions.map((item) => (
                    <option key={item} value={item} className="bg-[#100D1B] text-[#F8FAFC]">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sorting */}
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-[#302641] rounded-xl p-2.5 text-sm bg-[#100D1B] text-[#F8FAFC] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition"
                >
                  <option value="newest" className="bg-[#100D1B] text-[#F8FAFC]">Newest First</option>
                  <option value="relevance" className="bg-[#100D1B] text-[#F8FAFC]">Most Relevant</option>
                  <option value="lowToHigh" className="bg-[#100D1B] text-[#F8FAFC]">Price: Low to High</option>
                  <option value="highToLow" className="bg-[#100D1B] text-[#F8FAFC]">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Price Range & Hide Sold */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#302641] items-end">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Min Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full border border-[#302641] rounded-xl p-2.5 text-sm bg-[#100D1B] text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Max Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full border border-[#302641] rounded-xl p-2.5 text-sm bg-[#100D1B] text-[#F8FAFC] placeholder-[#71717A] focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition"
                />
              </div>

              <div className="flex items-center h-10">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideSold}
                    onChange={(e) => setHideSold(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#A855F7] bg-[#100D1B] border-[#302641] cursor-pointer"
                  />
                  <span className="text-xs font-medium text-[#A1A1AA] hover:text-[#F8FAFC] transition">
                    Hide sold listings
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#F8FAFC]">
              {category === "All" ? "All Marketplace Products" : `${category} Listings`}
            </h2>

            <span className="text-xs font-medium text-[#D8B4FE] bg-[#1E1930] border border-[#302641] px-3 py-1 rounded-full">
              Showing {filteredProducts.length} product(s)
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950/40 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Product Grid / Loading / Empty */}
          {loading ? (
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
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
            <div className="bg-[#171326] rounded-2xl p-12 text-center border border-[#302641] max-w-lg mx-auto shadow-lg">
              <p className="text-6xl mb-4">🔍</p>

              <h3 className="text-xl font-bold text-[#F8FAFC]">
                No Matching Products Found
              </h3>

              <p className="text-[#A1A1AA] text-sm mt-2">
                We couldn&apos;t find any items matching your active search terms or filters.
              </p>

              <button
                onClick={resetFilters}
                className="mt-6 bg-[#A855F7] hover:bg-[#9333EA] text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-purple-900/30 text-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090711] flex items-center justify-center">
          <p className="text-[#A855F7] font-semibold">Loading marketplace...</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
