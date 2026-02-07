import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function slugify(str = "") {
    return str
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export async function GET() {
    try {
        // Ensure default categories exist
        const defaults = ["Men", "Women", "Teens", "Kids", "Sports"];

        for (const name of defaults) {
            const slug = name.toLowerCase();
            const exists = await prisma.category.findFirst({
                where: { slug }
            });

            if (!exists) {
                await prisma.category.create({
                    data: {
                        name,
                        slug,
                        showInNavbar: true,
                        showInHome: true,
                        isActive: true,
                        sortNavbar: 0,
                    }
                });
            }
        }

        const categories = await prisma.category.findMany({
            where: {
                parentId: null
            },
            include: {
                subCategories: {
                    orderBy: { sortOrder: 'asc' }
                }
            },
            orderBy: {
                sortOrder: 'asc'
            }
        });

        return NextResponse.json({ success: true, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        const name = (body?.name || "").trim();
        const parentId = body?.parentId || null;

        if (!name) {
            return NextResponse.json(
                { success: false, error: "Category name required" },
                { status: 400 }
            );
        }

        const slug = body?.slug ? slugify(body.slug) : slugify(name);

        // Prevent duplicate slug
        const existing = await prisma.category.findFirst({ where: { slug } });
        if (existing) {
            return NextResponse.json(
                { success: false, error: "Slug already exists: " + slug },
                { status: 409 }
            );
        }

        const created = await prisma.category.create({
            data: {
                name,
                slug,
                parentId,
                showInNavbar: body.showInNavbar !== undefined ? body.showInNavbar : true,
                showInHome: body.showInHome !== undefined ? body.showInHome : false,
                isActive: true
            },
        });

        return NextResponse.json({ success: true, category: created }, { status: 201 });
    } catch (err) {
        console.error("POST category error:", err);
        return NextResponse.json(
            { success: false, error: "Server error", details: err.message },
            { status: 500 }
        );
    }
}
