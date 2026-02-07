import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
        }

        // Validation
        if (!file.type.startsWith("image/")) {
            return NextResponse.json({ ok: false, error: "Only images are allowed" }, { status: 400 });
        }

        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ ok: false, error: "Image size must be less than 2MB" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "public", "uploads", "home-tiles");

        // Ensure directory exists
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (err) {
            // Already exists or other error
        }

        const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const filePath = path.join(uploadDir, uniqueName);

        await writeFile(filePath, buffer);

        return NextResponse.json({
            ok: true,
            url: `/uploads/home-tiles/${uniqueName}`
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
}
