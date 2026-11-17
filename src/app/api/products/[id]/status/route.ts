import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Notification from "@/models/Notification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH: Update product status
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, isActive } = body;

    const updateFields: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!["Available", "Reserved", "Sold"].includes(status)) {
        return NextResponse.json(
          { message: "Status must be Available, Reserved, or Sold" },
          { status: 400 }
        );
      }
      updateFields.status = status;
    }

    if (isActive !== undefined) {
      updateFields.isActive = Boolean(isActive);
    }

    await connectDB();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // In-app notifications when a product is marked Reserved or Sold
    if (status === "Reserved" || status === "Sold") {
      try {
        await Notification.create({
          recipient: updatedProduct.seller,
          title: `Product marked as ${status}`,
          message: `Your listing "${updatedProduct.name}" has been marked as ${status}.`,
          type: status === "Reserved" ? "product_reserved" : "product_sold",
          relatedProduct: updatedProduct._id,
        });
      } catch (notifyErr) {
        console.error("Error creating status notification:", notifyErr);
      }
    }

    return NextResponse.json({
      message: `Product status updated to ${status || "updated"} successfully`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT STATUS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update product status" },
      { status: 500 }
    );
  }
}

