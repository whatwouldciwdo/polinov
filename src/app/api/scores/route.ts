import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  // Check if already scored
  const existingScore = await prisma.score.findFirst({
    where: { userId, candidateId },
  });

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
    const weights: Record<string, number> = {
      "1": 0.10,
      "2": 0.20,
      "3": 0.20,
      "4": 0.20,
      "5": 0.15,
      "6": 0.05,
      "7": 0.10,
    };
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

  let scoreId: number;

  if (existingScore) {
    // Update existing score record with updated breakdown & feedback
    await (prisma as any).$executeRawUnsafe(
      "UPDATE scores SET score = $1, details = $2::jsonb, feedback = $3, updated_at = NOW() WHERE id = $4",
      String(totalScore),
      JSON.stringify(body.scores || null),
      body.feedback ? String(body.feedback).trim() : null,
      existingScore.id
    );
    scoreId = existingScore.id;
  } else {
    // Insert new score record
    const result: any = await (prisma as any).$queryRawUnsafe(
      "INSERT INTO scores (candidate_id, score, details, feedback, user_id, created_at, updated_at) VALUES ($1, $2, $3::jsonb, $4, $5, NOW(), NOW()) RETURNING id",
      candidateId,
      String(totalScore),
      JSON.stringify(body.scores || null),
      body.feedback ? String(body.feedback).trim() : null,
      userId
    );
    scoreId = result[0]?.id;
  }

  return NextResponse.json({ id: scoreId });
}
