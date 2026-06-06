import { NextResponse } from "next/server";
import { buildAuthUrl } from "@/lib/google-auth";

export async function GET() {
  return NextResponse.redirect(buildAuthUrl());
}
