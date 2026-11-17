import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// GET: Fetch products with filtering, search, and sorting
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const listingType = searchParams.get("listingType");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "newest";
    const seller = searchParams.get("seller")?.trim();
    const status = searchParams.get("status");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query: Record<string, unknown> = {};

    // Filter by active status unless specifically requesting inactive/all
    if (!includeInactive) {
      query.isActive = { $ne: false };
    }

    // Filter by seller if specified
    if (seller) {
      query.seller = { $regex: new RegExp(`^${seller}$`, "i") };
    }

    // Filter by status if specified
    if (status && status !== "All") {
      query.status = status;
    }

    // Category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Condition filter
    if (condition && condition !== "All") {
      query.condition = condition;
    }

    // Listing type filter
    if (listingType && listingType !== "All") {
      query.listingType = listingType;
    }

    // Price range filter
    const priceFilter: { $gte?: number; $lte?: number } = {};
    if (minPrice && !isNaN(Number(minPrice))) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      priceFilter.$lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      query.price = priceFilter;
    }

    // Text search by name or description
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    // Sorting
    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy === "lowToHigh") {
      sortOption = { price: 1 };
    } else if (sortBy === "highToLow") {
      sortOption = { price: -1 };
    } else if (sortBy === "oldest") {
      sortOption = { createdAt: 1 };
    }

    let products = await Product.find(query).sort(sortOption).lean();

    // If relevance sort requested and search is provided, score name matches higher
    if (sortBy === "relevance" && search) {
      const lowerSearch = search.toLowerCase();
      products = [...products].sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const aNameMatch = aName.includes(lowerSearch) ? 2 : 0;
        const bNameMatch = bName.includes(lowerSearch) ? 2 : 0;
        const aDescMatch = a.description.toLowerCase().includes(lowerSearch) ? 1 : 0;
        const bDescMatch = b.description.toLowerCase().includes(lowerSearch) ? 1 : 0;
        return bNameMatch + bDescMatch - (aNameMatch + aDescMatch);
      });
    }

    return NextResponse.json(products, {
      status: 200,
    });
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Add a new product
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      name,
      price,
      category,
      condition,
      emoji,
      image,
      seller,
      description,
      phone,
      listingType,
      location,
    } = body;

    // Check required fields
    if (
      !name?.trim() ||
      !category?.trim() ||
      !condition?.trim() ||
      !seller?.trim() ||
      !description?.trim() ||
      !phone?.trim()
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    // Validate phone number (basic validation: at least 7 digits, typically 10)
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
      return NextResponse.json(
        { message: "Please enter a valid phone number (7 to 15 digits)." },
        { status: 400 }
      );
    }

    // Validate listing type
    const allowedTypes = ["For Sale", "Free", "Exchange"];
    const selectedType = listingType || "For Sale";

    if (!allowedTypes.includes(selectedType)) {
      return NextResponse.json(
        { message: "Invalid listing type. Must be For Sale, Free, or Exchange." },
        { status: 400 }
      );
    }

    // Validate price
    const productPrice = selectedType === "Free" ? 0 : Number(price);

    if (
      !Number.isFinite(productPrice) ||
      productPrice < 0 ||
      (selectedType === "For Sale" && productPrice <= 0)
    ) {
      return NextResponse.json(
        { message: "Please enter a valid price for items for sale." },
        { status: 400 }
      );
    }

    // Create product
    const newProduct = await Product.create({
      name: name.trim(),
      price: productPrice,
      category: category.trim(),
      condition: condition.trim(),
      emoji: emoji || "📦",
      image: image || "",
      seller: seller.trim(),
      description: description.trim(),
      phone: cleanPhone,
      listingType: selectedType,
      location: location?.trim() || "Campus Center",
      status: "Available",
      isActive: true,
    });

    return NextResponse.json(
      {
        message: "Product added successfully!",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to add product" },
      { status: 500 }
    );
  }
}
