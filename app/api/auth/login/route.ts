import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  });

  const validPassword = user ? await bcrypt.compare(body.password, user.passwordHash) : false;

  if (!user || !validPassword) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signJwt({ userId: user.id, email: user.email });

  const res = NextResponse.json({ id: user.id, email: user.email, name: user.name, token });
  res.cookies.set("token", token, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
