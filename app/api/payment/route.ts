// Deprecated: use /api/checkout for pay-per-doc and /api/checkout/subscription for subscriptions.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Use POST /api/checkout instead." },
    { status: 410 }
  );
}
