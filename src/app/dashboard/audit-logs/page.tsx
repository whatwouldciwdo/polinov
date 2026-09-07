import { prisma } from "@/lib/prisma";
import AuditLogsView, { AuditLogItem } from "./AuditLogsView";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const [scores, totalCandidatesCount] = await Promise.all([
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
    prisma.candidate.count(),
  ]);

  const formattedLogs: AuditLogItem[] = scores.map((s) => ({
    id: s.id,
    score: s.score,
    createdAt: s.createdAt.toISOString(),
    user: s.user,
    candidate: s.candidate,
  }));

  return (
    <AuditLogsView
      initialLogs={formattedLogs}
      totalCandidatesCount={totalCandidatesCount}
    />
  );
}
