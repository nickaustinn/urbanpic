import { NextRequest, NextResponse } from "next/server";
import { classifyImage } from "@/lib/claude";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.imageBase64) {
    return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 });
  }

  try {
    const result = await classifyImage(body.imageBase64);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[classify]", err);
    return NextResponse.json({ error: "Classification failed" }, { status: 500 });
  }
}
