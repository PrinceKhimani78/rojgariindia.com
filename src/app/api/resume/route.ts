import { NextResponse } from "next/server";

// ⚠️ DEPRECATED: This endpoint is no longer used
// Frontend now calls backend API directly at /api/candidate-profile

export async function POST(req: Request) {
  return NextResponse.json(
    {
      success: false,
      error: "DEPRECATED: This endpoint no longer exists. Use backend API at /api/candidate-profile"
    },
    { status: 410 } // 410 Gone
  );
}
