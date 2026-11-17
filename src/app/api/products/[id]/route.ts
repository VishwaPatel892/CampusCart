import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Enquiry from "@/models/Enquiry";
import Notification from "@/models/Notification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET: Fetch one product
export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...product,
      _id: product._id.toString(),
    });
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT: Full update of a product
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

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
      status,
      isActive,
      location,
    } = body;

    if (
      !name?.trim() ||
      !category?.trim() ||
      !condition?.trim() ||
      !seller?.trim() ||
      !description?.trim() ||
      !phone?.trim()
    ) {
      return NextResponse.json(
        { message: "Please fill in all required fields" },
        { status: 400 }
      );
    }

    const selectedType = listingType || "For Sale";
    const productPrice = selectedType === "Free" ? 0 : Number(price);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      return NextResponse.json(
        { message: "Please enter a valid price" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        price: productPrice,
        category: category.trim(),
        condition: condition.trim(),
        emoji: emoji || "📦",
        image: image !== undefined ? image : "",
        seller: seller.trim(),
        description: description.trim(),
        phone: phone.trim(),
        listingType: selectedType,
        location: location ? location.trim() : "Campus Center",
        ...(status ? { status } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// PATCH: Partial update (status, isActive, etc.)
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

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided for update" },
        { status: 400 }
      );
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
      message: `Product ${status ? `status updated to ${status}` : "updated successfully"}`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("PATCH PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Also delete any enquiries associated with this product
    await Enquiry.deleteMany({ product: id });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
