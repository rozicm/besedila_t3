import { NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Disable auth for now to fix Vercel build
export function GET() {
  return NextResponse.json({ error: "Authentication disabled" }, { status: 501 });
}

export function POST() {
  return NextResponse.json({ error: "Authentication disabled" }, { status: 501 });
}


