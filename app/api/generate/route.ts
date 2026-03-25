import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Contract generation endpoint — not yet implemented" }, { status: 501 });
}
