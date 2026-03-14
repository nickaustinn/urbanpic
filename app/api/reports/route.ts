import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { IssueType } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") as IssueType | null;
  const userId = searchParams.get("userId");

  const authUser = await getAuthUser(req);

  const where: Record<string, unknown> = {};
  if (type) where.issueType = type;
  // "me" means fetch the authenticated user's reports
  if (userId === "me" && authUser) where.userId = authUser.userId;

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      imageUrl: true,
      issueType: true,
      severity: true,
      description: true,
      department: true,
      latitude: true,
      longitude: true,
      address: true,
      status: true,
      createdAt: true,
      userId: true,
    },
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Request body required" }, { status: 400 });
  }

  const { imageUrl, issueType, severity, description, department, latitude, longitude, address, aiRaw } = body;

  if (!imageUrl || !issueType || !description || latitude == null || longitude == null) {
    return NextResponse.json(
      { error: "Missing required fields: imageUrl, issueType, description, latitude, longitude" },
      { status: 400 }
    );
  }

  const authUser = await getAuthUser(req);

  const report = await prisma.report.create({
    data: {
      imageUrl,
      issueType,
      severity: severity ?? "MEDIUM",
      description,
      department: department ?? "City Services 311",
      latitude,
      longitude,
      address: address ?? null,
      aiRaw: aiRaw ?? undefined,
      userId: authUser?.userId ?? null,
    },
  });

  return NextResponse.json(report, { status: 201 });
}
