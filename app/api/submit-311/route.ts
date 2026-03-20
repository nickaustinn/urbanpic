import { NextRequest, NextResponse } from "next/server";
import { submitToSJC311 } from "@/lib/sjc311";
import { isInSanJoaquinCounty } from "@/lib/geofence";
import { isRateLimited } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // skip verification if not configured

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
  });

  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many reports. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: "Request body required" }, { status: 400 });
  }

  const { srTypeId, description, latitude, longitude, address, imageBase64, turnstileToken, issueType, severity, department } = body;

  if (!srTypeId || latitude == null || longitude == null) {
    return NextResponse.json(
      { error: "Missing required fields: srTypeId, latitude, longitude" },
      { status: 400 }
    );
  }

  // Verify Turnstile captcha
  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Please complete the captcha verification." },
      { status: 400 }
    );
  }

  const turnstileValid = await verifyTurnstile(turnstileToken);
  if (!turnstileValid) {
    return NextResponse.json(
      { error: "Captcha verification failed. Please try again." },
      { status: 403 }
    );
  }

  const inCounty = isInSanJoaquinCounty(latitude, longitude);

  try {
    // Always save to our database
    const report = await prisma.report.create({
      data: {
        imageUrl: imageBase64 ? "(base64 image attached)" : "/uploads/placeholder.jpg",
        issueType: issueType ?? "OTHER",
        severity: severity ?? "MEDIUM",
        description: description ?? "",
        department: department ?? "City Services 311",
        latitude,
        longitude,
        address: address ?? null,
      },
    });

    // TODO: Re-enable when ready to send real 311 reports
    // Only submit to SJC 311 if within San Joaquin County
    // if (inCounty) {
    //   const result = await submitToSJC311(
    //     {
    //       srTypeId,
    //       description: description ?? "",
    //       latitude,
    //       longitude,
    //       address: address ?? "",
    //       isAnonymous: true,
    //     },
    //     imageBase64 ?? null
    //   );
    //
    //   return NextResponse.json(
    //     { ...result, reportId: report.id, sentTo311: true },
    //     { status: 201 }
    //   );
    // }

    // Outside SJC - save locally only
    return NextResponse.json(
      {
        reportId: report.id,
        sentTo311: false,
        message: "Report saved! Since your location is outside San Joaquin County, it was not sent to SJC 311.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/submit-311]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 }
    );
  }
}
