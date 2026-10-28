import { prisma } from "@/lib/prisma";
import TableScoreView, { CandidateScoreItem } from "./TableScoreView";

export const dynamic = "force-dynamic";

export default async function TableScorePage() {
  const candidates = await prisma.candidate.findMany({
    include: { scores: true },
    orderBy: { id: "asc" },
  });

  const candidatesWithAvg: CandidateScoreItem[] = candidates.map((cd) => {
    const validScores = cd.scores
      .map((s) => parseFloat(s.score))
      .filter((n) => !isNaN(n));

    const avg =
      validScores.length > 0
        ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length
        : 0;

    return {
      id: cd.id,
      name: cd.name,
      category: (cd as any).category || "TEKNIK",
      candidateNip: cd.candidateNip || "-",
      candidatePosition: cd.candidatePosition || "-",
      avg,
      scoreCount: validScores.length,
      globalRank: 0,
    };
  });

  // Calculate global rank by sorting descending
  candidatesWithAvg.sort((a, b) => b.avg - a.avg);
  candidatesWithAvg.forEach((c, idx) => {
    c.globalRank = idx + 1;
  });

  return <TableScoreView initialCandidates={candidatesWithAvg} />;
}
