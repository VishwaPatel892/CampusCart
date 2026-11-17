import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: "No image file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message:
            "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Image file size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe, unique filename
    const ext = path.extname(file.name) || ".jpg";
    const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, "").toLowerCase() || ".jpg";
    const filename = `img_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json(
      {
        message: "Image uploaded successfully.",
        url: publicUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { message: "Failed to upload image." },
      { status: 500 }
    );
  }
}

