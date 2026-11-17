import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Enquiry from "@/models/Enquiry";
import Product from "@/models/Product";
import Notification from "@/models/Notification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  return handleUpdate(request, params);
}

export async function PATCH(request: Request, { params }: RouteContext) {
  return handleUpdate(request, params);
}

async function handleUpdate(
  request: Request,
  paramsPromise: Promise<{ id: string }>
) {
  try {
    await connectDB();

    const { id } = await paramsPromise;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid enquiry ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["Accepted", "Rejected", "Pending"].includes(status)) {
      return NextResponse.json(
        { message: "Status must be Accepted, Rejected, or Pending" },
        { status: 400 }
      );
    }

    const enquiry = await Enquiry.findById(id).populate("product");

    if (!enquiry) {
      return NextResponse.json(
        { message: "Enquiry not found" },
        { status: 404 }
      );
    }

    // If enquiry is already in the target status
    if (enquiry.status === status) {
      return NextResponse.json({
        message: `This enquiry is already ${status.toLowerCase()}.`,
        enquiry,
      });
    }

    const productDoc = await Product.findById(
      typeof enquiry.product === "object" ? enquiry.product._id : enquiry.product
    );

    if (!productDoc) {
      return NextResponse.json(
        { message: "The product associated with this enquiry no longer exists." },
        { status: 404 }
      );
    }

    if (status === "Accepted") {
      // Check if product is already Reserved or Sold by another transaction
      if (productDoc.status === "Sold") {
        return NextResponse.json(
          { message: "Cannot accept offer: This product has already been sold." },
          { status: 409 }
        );
      }

      // Check if another enquiry for this product is already Accepted
      const conflictingAccepted = await Enquiry.findOne({
        product: productDoc._id,
        _id: { $ne: enquiry._id },
        status: "Accepted",
      });

      if (conflictingAccepted) {
        return NextResponse.json(
          {
            message:
              "Another offer has already been accepted for this product. You cannot accept conflicting offers.",
          },
          { status: 409 }
        );
      }

      // Reserve the product
      productDoc.status = "Reserved";
      await productDoc.save();

      // Notify the buyer
      try {
        await Notification.create({
          recipient: enquiry.buyerPhone,
          title: "Offer Accepted! 🎉",
          message: `Your offer/enquiry for "${productDoc.name}" was accepted by the seller! The product is now reserved for you.`,
          type: "offer_accepted",
          relatedProduct: productDoc._id,
          relatedEnquiry: enquiry._id,
        });

        // Also notify with buyerName as recipient so either lookup works
        if (enquiry.buyerName) {
          await Notification.create({
            recipient: enquiry.buyerName,
            title: "Offer Accepted! 🎉",
            message: `Your offer/enquiry for "${productDoc.name}" was accepted by the seller! The product is now reserved for you.`,
            type: "offer_accepted",
            relatedProduct: productDoc._id,
            relatedEnquiry: enquiry._id,
          });
        }
      } catch (notifErr) {
        console.error("Failed to notify buyer of acceptance:", notifErr);
      }
    } else if (status === "Rejected") {
      // If we are rejecting an enquiry that was previously accepted, revert product reservation if no other accepted enquiry exists
      if (enquiry.status === "Accepted") {
        const otherAccepted = await Enquiry.findOne({
          product: productDoc._id,
          _id: { $ne: enquiry._id },
          status: "Accepted",
        });

        if (!otherAccepted && productDoc.status === "Reserved") {
          productDoc.status = "Available";
          await productDoc.save();
        }
      }

      // Notify the buyer
      try {
        await Notification.create({
          recipient: enquiry.buyerPhone,
          title: "Offer Update",
          message: `The seller was unable to accept your offer for "${productDoc.name}".`,
          type: "offer_rejected",
          relatedProduct: productDoc._id,
          relatedEnquiry: enquiry._id,
        });

        if (enquiry.buyerName) {
          await Notification.create({
            recipient: enquiry.buyerName,
            title: "Offer Update",
            message: `The seller was unable to accept your offer for "${productDoc.name}".`,
            type: "offer_rejected",
            relatedProduct: productDoc._id,
            relatedEnquiry: enquiry._id,
          });
        }
      } catch (notifErr) {
        console.error("Failed to notify buyer of rejection:", notifErr);
      }
    }

    enquiry.status = status;
    await enquiry.save();

    return NextResponse.json({
      message:
        status === "Accepted"
          ? "Enquiry accepted and product reserved successfully."
          : `Enquiry ${status.toLowerCase()} successfully.`,
      enquiry,
      product: productDoc,
    });
  } catch (error) {
    console.error("Enquiry update error:", error);

    return NextResponse.json(
      { message: "Failed to update enquiry." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid enquiry ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Enquiry.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Enquiry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Enquiry deleted successfully",
    });
  } catch (error) {
    console.error("Delete enquiry error:", error);

    return NextResponse.json(
      { message: "Failed to delete enquiry." },
      { status: 500 }
    );
  }
}
