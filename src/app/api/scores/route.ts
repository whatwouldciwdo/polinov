import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EVALUATION_CRITERIA } from "@/lib/criteria";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { candidate_id, score10, score15, score5 } = body;

  if (!candidate_id) {
    return NextResponse.json({ error: "Pilih kandidat terlebih dahulu" }, { status: 400 });
  }

  const userId = parseInt(session.user.id);
  const candidateId = parseInt(candidate_id);

  // Check if already scored (1 user can only score 1 candidate once)
  const existingScore = await prisma.score.findFirst({
    where: { userId, candidateId },
  });

  if (existingScore) {
    return NextResponse.json(
      { error: "Anda sudah pernah memberikan penilaian untuk judul inovasi ini. Setiap penilai hanya dapat menilai 1 kali per judul." },
      { status: 400 }
    );
  }

  // Calculate total score based on new criteria or legacy format
  let totalScore = 0;

  // 1. New criteria format: array of { criterion_id, score, weight } or scores array
  if (body.scores && Array.isArray(body.scores)) {
    for (const item of body.scores) {
      const s = parseFloat(item.score || 0);
      const w = parseFloat(item.weight || 0);
      totalScore += s * w;
    }
  } else if (body.criteria_scores && typeof body.criteria_scores === "object") {
    // Or object with weights: { "1": 80, "2": 100, ... }
    const weights: Record<string, number> = Object.fromEntries(
      EVALUATION_CRITERIA.map((c) => [String(c.id), c.weight])
    );
    for (const [key, val] of Object.entries(body.criteria_scores)) {
      const weight = weights[key] ?? 0;
      totalScore += parseFloat(val as string || "0") * weight;
    }
  } else {
    // Legacy support
    if (score10 && Array.isArray(score10)) {
      for (const s of score10) {
        totalScore += (parseFloat(s) * 10) / 100;
      }
    }
    if (score15 && Array.isArray(score15)) {
      for (const s of score15) {
        totalScore += (parseFloat(s) * 15) / 100;
      }
    }
    if (score5 && Array.isArray(score5)) {
      for (const s of score5) {
        totalScore += (parseFloat(s) * 5) / 100;
      }
    }
  }

  // Format to 2 decimal places if needed
  totalScore = Math.round(totalScore * 100) / 100;

  // Insert new score record
  const result: any = await (prisma as any).$queryRawUnsafe(
    "INSERT INTO scores (candidate_id, score, details, feedback, user_id, created_at, updated_at) VALUES ($1, $2, $3::jsonb, $4, $5, NOW(), NOW()) RETURNING id",
    candidateId,
    String(totalScore),
    JSON.stringify(body.scores || null),
    body.feedback ? String(body.feedback).trim() : null,
    userId
  );
  const scoreId = result[0]?.id;

  return NextResponse.json({ id: scoreId });
}
