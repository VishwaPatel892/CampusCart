import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Product from "@/models/Product";
import Notification from "@/models/Notification";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const seller = searchParams.get("seller")?.trim();
    const buyerPhone = searchParams.get("buyerPhone")?.trim();
    const productId = searchParams.get("productId")?.trim();

    interface IEnquiryFilter {
      product?: unknown;
      buyerPhone?: unknown;
    }

    const filter: IEnquiryFilter = {};

    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      filter.product = new mongoose.Types.ObjectId(productId);
    }

    if (buyerPhone) {
      filter.buyerPhone = buyerPhone;
    }

    // If filtering by seller, first find the seller's product IDs
    if (seller) {
      const sellerProducts = await Product.find({
        seller: { $regex: new RegExp(`^${seller}$`, "i") },
      })
        .select("_id")
        .lean();

      const productIds = sellerProducts.map((p) => p._id);
      filter.product = { $in: productIds };
    }

    const enquiries = await Enquiry.find(filter)
      .populate("product", "name price seller listingType status image emoji phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(enquiries, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Fetch enquiries error:", error);

    return NextResponse.json(
      { message: "Failed to fetch enquiries." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const { productId, buyerName, buyerPhone, message, offerPrice } = body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: "Invalid product ID." },
        { status: 400 }
      );
    }

    if (!buyerName?.trim() || !buyerPhone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { message: "Please fill in all required fields (Name, Phone, and Message)." },
        { status: 400 }
      );
    }

    const cleanPhone = buyerPhone.trim().replace(/\s+/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
      return NextResponse.json(
        { message: "Please enter a valid phone number." },
        { status: 400 }
      );
    }

    if (
      offerPrice !== undefined &&
      offerPrice !== null &&
      offerPrice !== "" &&
      (!Number.isFinite(Number(offerPrice)) || Number(offerPrice) < 0)
    ) {
      return NextResponse.json(
        { message: "Please enter a valid offer price." },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 }
      );
    }

    if (product.status && product.status !== "Available") {
      return NextResponse.json(
        {
          message: `This product is currently marked as ${product.status.toLowerCase()} and is not accepting enquiries.`,
        },
        { status: 409 }
      );
    }

    // Check for duplicate enquiry within last 2 minutes to prevent spam / double submission
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    const existingEnquiry = await Enquiry.findOne({
      product: product._id,
      buyerPhone: cleanPhone,
      createdAt: { $gte: twoMinutesAgo },
    });

    if (existingEnquiry) {
      return NextResponse.json(
        {
          message:
            "You have already sent an enquiry for this product recently. Please wait before submitting again.",
        },
        { status: 429 }
      );
    }

    const parsedOffer =
      offerPrice === undefined || offerPrice === null || offerPrice === ""
        ? null
        : Number(offerPrice);

    const enquiry = await Enquiry.create({
      product: product._id,
      buyerName: buyerName.trim(),
      buyerPhone: cleanPhone,
      message: message.trim(),
      offerPrice: parsedOffer,
      status: "Pending",
    });

    // Notify the seller
    try {
      const offerText =
        parsedOffer !== null ? ` with an offer of ₹${parsedOffer}` : "";
      await Notification.create({
        recipient: product.seller,
        title: "New Enquiry Received",
        message: `${buyerName.trim()} sent an enquiry for "${product.name}"${offerText}.`,
        type: "enquiry_received",
        relatedProduct: product._id,
        relatedEnquiry: enquiry._id,
      });
    } catch (notifErr) {
      console.error("Failed to create seller notification:", notifErr);
    }

    return NextResponse.json(
      {
        message: "Enquiry submitted successfully.",
        enquiry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create enquiry error:", error);

    return NextResponse.json(
      { message: "Failed to submit enquiry." },
      { status: 500 }
    );
  }
}
