import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const candidates = await prisma.candidate.findMany({
    orderBy: { id: "desc" },
  });
  return NextResponse.json(candidates);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const name = ((formData.get("name") || formData.get("title")) as string)?.trim();
    const file = formData.get("file") as File | null;
    const membersRaw = formData.get("members_data") as string | null;

    if (!name) {
      return NextResponse.json(
        { error: "Judul inovasi / makalah wajib diisi" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "candidates");
    await mkdir(uploadDir, { recursive: true });

    // Handle document upload
    let filePath: string | null = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${Date.now()}-${safeName}`;
      await writeFile(path.join(uploadDir, fileName), buffer);
      filePath = `uploads/candidates/${fileName}`;
    }

    // Parse members list
    let membersList: Array<{
      name: string;
      nip: string;
      position: string;
      photo?: string | null;
    }> = [];

    if (membersRaw) {
      try {
        membersList = JSON.parse(membersRaw);
      } catch (e) {
        console.error("Failed to parse members JSON:", e);
      }
    }

    // Process photo uploads for each member
    for (let i = 0; i < membersList.length; i++) {
      const photoFile = formData.get(`member_photo_${i}`) as File | null;
      if (photoFile && photoFile.size > 0) {
        const bytes = await photoFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const safeName = photoFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const photoName = `photo-${Date.now()}-${i}-${safeName}`;
        await writeFile(path.join(uploadDir, photoName), buffer);
        membersList[i].photo = `uploads/candidates/${photoName}`;
      }
    }

    // Primary NIP and Position from first member (or legacy fields)
    const candidateNip =
      membersList[0]?.nip ||
      (formData.get("candidate_nip") as string) ||
      "-";
    const candidatePosition =
      membersList[0]?.position ||
      (formData.get("candidate_position") as string) ||
      "-";

    await (prisma.candidate as any).create({
      data: {
        name,
        candidateNip,
        candidatePosition,
        file: filePath,
        members: membersList,
      },
    });

    return NextResponse.json({ message: "Makalah dan kandidat berhasil ditambahkan." });
  } catch (err: any) {
    console.error("Error creating candidate:", err);
    return NextResponse.json(
      { error: err.message || "Gagal menyimpan data inovasi." },
      { status: 500 }
    );
  }
}
