import { NextRequest } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store",
};

/** GET — streams random bytes for download speed measurement (up to 500MB) */
export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const totalBytes = Math.min(
    parseInt(sizeParam || "1048576", 10) || 1048576,
    524_288_000, // max 500MB
  );

  // For small requests (< 4MB), respond with a single buffer
  if (totalBytes < 4_194_304) {
    const buf = Buffer.alloc(totalBytes, 0x58);
    return new Response(buf, {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/octet-stream", "Content-Length": String(totalBytes) },
    });
  }

  // For large requests, stream in 2MB chunks to avoid memory spikes
  const CHUNK = 2 * 1024 * 1024;
  const chunk = Buffer.alloc(CHUNK, 0x58);
  let sent = 0;

  const stream = new ReadableStream({
    pull(controller) {
      const remaining = totalBytes - sent;
      if (remaining <= 0) {
        controller.close();
        return;
      }
      const size = Math.min(CHUNK, remaining);
      controller.enqueue(size === CHUNK ? chunk : chunk.subarray(0, size));
      sent += size;
    },
  });

  return new Response(stream, {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/octet-stream", "Content-Length": String(totalBytes) },
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
