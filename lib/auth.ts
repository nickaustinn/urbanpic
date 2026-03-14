import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);

export interface JwtPayload {
  userId: string;
  email: string;
}

export async function signJwt(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<JwtPayload | null> {
  const cookie = req.cookies.get("token")?.value;
  const header = req.headers.get("authorization")?.replace("Bearer ", "");
  const token = cookie ?? header;
  if (!token) return null;
  return verifyJwt(token);
}
