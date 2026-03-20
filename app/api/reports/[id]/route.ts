import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { ReportStatus } from "@/lib/types";

const VALID_STATUSES = new Set<string>(["PENDING", "IN_PROGRESS", "RESOLVED"]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_req: NextRequest, context: any) {
  const { id } = await context.params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(req: NextRequest, context: any) {
  const { id } = await context.params;
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.status || !VALID_STATUSES.has(body.status)) {
    return NextResponse.json(
      { error: "Valid status required: PENDING | IN_PROGRESS | RESOLVED" },
      { status: 400 }
    );
  }

  const existing = await prisma.report.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.userId !== authUser.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.report.update({
    where: { id },
    data: { status: body.status as ReportStatus },
  });

  return NextResponse.json(updated);
}
