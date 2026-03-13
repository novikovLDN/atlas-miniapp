import { NextRequest } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

/** GET — returns random bytes for download speed measurement */
export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const bytes = Math.min(parseInt(sizeParam || "1048576", 10) || 1048576, 10_485_760); // max 10MB
  const buf = Buffer.alloc(bytes, 0x58); // fill with 'X'
  return new Response(buf, {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/octet-stream" },
  });
}

/** POST — accepts upload payload, returns bytes received */
export async function POST(request: NextRequest) {
  const body = await request.arrayBuffer();
  return new Response(JSON.stringify({ bytes: body.byteLength }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
