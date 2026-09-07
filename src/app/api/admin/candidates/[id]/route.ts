import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const candidate = await prisma.candidate.findUnique({
    where: { id: parseInt(id) },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const name = ((formData.get("name") || formData.get("title")) as string)?.trim();
    const file = formData.get("file") as File | null;
    const membersRaw = formData.get("members_data") as string | null;

    const data: any = {};
    if (name) data.name = name;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "candidates");
    await mkdir(uploadDir, { recursive: true });

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileName = `${Date.now()}-${safeName}`;
      await writeFile(path.join(uploadDir, fileName), buffer);
      data.file = `uploads/candidates/${fileName}`;
    }

    if (membersRaw) {
      try {
        const membersList: Array<{
          name: string;
          nip: string;
          position: string;
          photo?: string | null;
        }> = JSON.parse(membersRaw);

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

        data.members = membersList;
        if (membersList[0]) {
          data.candidateNip = membersList[0].nip || "-";
          data.candidatePosition = membersList[0].position || "-";
        }
      } catch (e) {
        console.error("Failed to parse members:", e);
      }
    }

    await (prisma.candidate as any).update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json({ message: "Candidate updated successfully." });
  } catch (err: any) {
    console.error("Error updating candidate:", err);
    return NextResponse.json(
      { error: err.message || "Gagal memperbarui data inovasi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.candidate.delete({
    where: { id: parseInt(id) },
  });

  return NextResponse.json({ message: "Candidate deleted successfully." });
}
