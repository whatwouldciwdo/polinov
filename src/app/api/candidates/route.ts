import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ? parseInt(session.user.id) : null;

  const candidates = await prisma.candidate.findMany({
    orderBy: { id: "asc" },
  });

  if (!userId) {
    return NextResponse.json(candidates);
  }

  // Get which candidates this user has already evaluated
  const userScores: any[] = await (prisma as any).$queryRawUnsafe(
    'SELECT candidate_id as "candidateId" FROM scores WHERE user_id = $1',
    userId
  );
  const scoredCandidateIds = new Set(userScores.map((s) => s.candidateId));

  const candidatesWithStatus = candidates.map((c) => ({
    ...c,
    isEvaluated: scoredCandidateIds.has(c.id),
  }));

  return NextResponse.json(candidatesWithStatus);
}
