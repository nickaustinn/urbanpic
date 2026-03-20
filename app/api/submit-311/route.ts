import { NextRequest, NextResponse } from "next/server";
import { submitToSJC311 } from "@/lib/sjc311";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Request body required" }, { status: 400 });
  }

  const { srTypeId, description, latitude, longitude, address, imageBase64 } = body;

  if (!srTypeId || latitude == null || longitude == null) {
    return NextResponse.json(
      { error: "Missing required fields: srTypeId, latitude, longitude" },
      { status: 400 }
    );
  }

  try {
    const result = await submitToSJC311(
      {
        srTypeId,
        description: description ?? "",
        latitude,
        longitude,
        address: address ?? "",
        isAnonymous: true,
      },
      imageBase64 ?? null
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submit-311]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
