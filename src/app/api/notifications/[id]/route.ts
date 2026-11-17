import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH: Mark single notification as read
export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid notification ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notification marked as read",
      notification: updated,
    });
  } catch (error) {
    console.error("UPDATE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE: Delete single notification
export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid notification ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);

    return NextResponse.json(
      { message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

