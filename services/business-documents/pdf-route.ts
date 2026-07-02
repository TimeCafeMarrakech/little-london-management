import { NextRequest, NextResponse } from "next/server";

export function createBusinessPdfResponse(request: NextRequest, pdf: Buffer, fileName: string): NextResponse {
  const body = new ArrayBuffer(pdf.byteLength);
  new Uint8Array(body).set(pdf);
  const download = request.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
