import { prisma } from "@/lib/prisma";
import AuditLogsView, { AuditLogItem, JudgeItem, CandidateItem } from "./AuditLogsView";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const [scores, candidates, judges] = await Promise.all([
    prisma.score.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            nip: true,
            role: true,
          },
        },
        candidate: {
          select: {
            id: true,
            name: true,
            candidateNip: true,
            candidatePosition: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.candidate.findMany({
      select: {
        id: true,
        name: true,
        candidateNip: true,
        candidatePosition: true,
      },
      orderBy: { id: "asc" },
    }),
    prisma.user.findMany({
      where: {
        OR: [{ role: "juri" }, { scores: { some: {} } }],
      },
      select: {
        id: true,
        name: true,
        nip: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const formattedLogs: AuditLogItem[] = scores.map((s) => ({
    id: s.id,
    score: s.score,
    feedback: s.feedback,
    createdAt: s.createdAt.toISOString(),
    user: s.user,
    candidate: s.candidate,
  }));

  const formattedCandidates: CandidateItem[] = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    candidateNip: c.candidateNip,
    candidatePosition: c.candidatePosition,
  }));

  const formattedJudges: JudgeItem[] = judges.map((j) => ({
    id: j.id,
    name: j.name,
    nip: j.nip,
    email: j.email,
    role: j.role,
  }));

  return (
    <AuditLogsView
      initialLogs={formattedLogs}
      totalCandidatesCount={candidates.length}
      allJudges={formattedJudges}
      allCandidates={formattedCandidates}
    />
  );
}
