import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

type RouteContext = {
  params: Promise<{ name: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  try {
    await connectDB();

    const { name } = await params;
    const decodedName = decodeURIComponent(name).trim();

    if (!decodedName) {
      return NextResponse.json(
        { message: "Seller name is required" },
        { status: 400 }
      );
    }

    const sellerRegex = new RegExp(`^${decodedName}$`, "i");

    const allListings = await Product.find({ seller: sellerRegex })
      .sort({ createdAt: -1 })
      .lean();

    if (allListings.length === 0) {
      return NextResponse.json(
        { message: "Seller not found or has no listings" },
        { status: 404 }
      );
    }

    const activeListings = allListings.filter(
      (item) => item.status !== "Sold" && item.isActive !== false
    );
    const soldListings = allListings.filter((item) => item.status === "Sold");
    const reservedListings = allListings.filter(
      (item) => item.status === "Reserved"
    );

    // Get phone from latest listing
    const contactPhone = allListings[0]?.phone || "";
    // Earliest listing date
    const earliestItem = [...allListings].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];

    return NextResponse.json({
      name: allListings[0].seller,
      phone: contactPhone,
      totalListings: allListings.length,
      activeCount: activeListings.length,
      soldCount: soldListings.length,
      reservedCount: reservedListings.length,
      memberSince: earliestItem?.createdAt || allListings[0].createdAt,
      activeListings,
      soldListings,
      allListings,
    });
  } catch (error) {
    console.error("GET SELLER PROFILE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch seller profile" },
      { status: 500 }
    );
  }
}

