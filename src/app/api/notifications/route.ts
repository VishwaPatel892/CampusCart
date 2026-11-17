import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

// GET: Fetch notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get("recipient")?.trim();

    interface INotifFilter {
      recipient?: unknown;
    }

    const filter: INotifFilter = {};

    if (recipient) {
      filter.recipient = { $regex: new RegExp(`^${recipient}$`, "i") };
    }

    const notifications = await Notification.find(filter)
      .populate("relatedProduct", "name price image emoji status")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(notifications, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// PATCH: Mark all as read for recipient
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { recipient } = body;

    if (!recipient?.trim()) {
      return NextResponse.json(
        { message: "Recipient is required to mark notifications as read" },
        { status: 400 }
      );
    }

    await Notification.updateMany(
      { recipient: { $regex: new RegExp(`^${recipient.trim()}$`, "i") } },
      { $set: { isRead: true } }
    );

    return NextResponse.json({
      message: "All notifications marked as read.",
    });
  } catch (error) {
    console.error("UPDATE NOTIFICATIONS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update notifications" },
      { status: 500 }
    );
  }
}

