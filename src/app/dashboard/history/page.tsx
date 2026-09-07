import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryView, { CandidateEvaluationItem } from "./HistoryView";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id);

  // Fetch all candidates and scores evaluated by this user
  const [candidates, userScores]: [any[], any[]] = await Promise.all([
    prisma.candidate.findMany({
      orderBy: { id: "asc" },
    }),
    (prisma as any).$queryRawUnsafe(
      'SELECT id, candidate_id as "candidateId", score, details, feedback, user_id as "userId", created_at as "createdAt", updated_at as "updatedAt" FROM scores WHERE user_id = $1',
      userId
    ),
  ]);

  // Map scores by candidateId for fast lookup
  const scoresByCandidateId = new Map(
    userScores.map((s: any) => [s.candidateId, s])
  );

  const items: CandidateEvaluationItem[] = candidates.map((cd) => {
    const existingScore: any = scoresByCandidateId.get(cd.id);
    return {
      id: cd.id,
      name: cd.name,
      candidateNip: cd.candidateNip,
      candidatePosition: cd.candidatePosition,
      isEvaluated: !!existingScore,
      scoreId: existingScore?.id ?? null,
      scoreValue: existingScore?.score ?? null,
      details: existingScore?.details ?? null,
      feedback: existingScore?.feedback ?? null,
      evaluatedAt: existingScore?.createdAt
        ? new Date(existingScore.createdAt).toISOString()
        : null,
    };
  });

  return (
    <HistoryView
      evaluatorName={session.user.name || "User"}
      evaluatorNip={session.user.nip}
      items={items}
    />
  );
}
