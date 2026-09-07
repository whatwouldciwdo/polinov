import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".txt": "text/plain",
};

function resolveCandidateFile(pathSegments: string[]): { filePath: string; stat: fs.Stats } | null {
  const decodedSegments = pathSegments.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  const cwd = process.cwd();
  const searchPaths = [
    path.resolve(cwd, "public", "uploads", "candidates", ...decodedSegments),
    path.resolve(cwd, "public", "uploads", ...decodedSegments),
    path.resolve(cwd, "public", "candidates", ...decodedSegments),
    path.resolve(cwd, "uploads", "candidates", ...decodedSegments),
  ];

  for (const candidatePath of searchPaths) {
    if (fs.existsSync(candidatePath)) {
      try {
        const stat = fs.statSync(candidatePath);
        if (stat.isFile()) {
          return { filePath: candidatePath, stat };
        }
      } catch {
        // continue
      }
    }
  }

  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const found = resolveCandidateFile(pathSegments);
    if (!found) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const { filePath, stat } = found;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error serving candidate file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const found = resolveCandidateFile(pathSegments);
    if (!found) {
      return new NextResponse(null, { status: 404 });
    }

    const { filePath, stat } = found;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
