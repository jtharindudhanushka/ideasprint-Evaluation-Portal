"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LayoutDashboard, Trophy, Clock, FileText, Search, ExternalLink, BarChart } from "lucide-react";
import type { Proposal, Profile, ProposalAssignment } from "@/lib/types/database";

interface Props {
  proposals: Proposal[];
  breakdownData?: Record<string, any[]>;
  evaluators?: Pick<Profile, "id" | "full_name">[];
  evaluatorByProposal?: Record<string, string[]>;
  assignments?: ProposalAssignment[];
}

export function AdminDashboardClient({ proposals, breakdownData = {}, evaluators = [], evaluatorByProposal = {}, assignments = [] }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const totalProposals = proposals.length;
  const gradedCount = proposals.filter((p) => p.is_graded).length;
  const pendingCount = totalProposals - gradedCount;
  const avgScore =
    gradedCount > 0
      ? Math.round(
          proposals
            .filter((p) => p.is_graded)
            .reduce((sum, p) => sum + p.total_score, 0) / gradedCount
        )
      : 0;

  const stats = [
    { label: "Total Proposals", value: totalProposals, icon: FileText },
    { label: "Graded", value: gradedCount, icon: Trophy },
    { label: "Pending", value: pendingCount, icon: Clock },
    { label: "Avg Score", value: avgScore, icon: LayoutDashboard },
  ];

  const evaluatorMap = useMemo(() => {
    return new Map(evaluators.map((e) => [e.id, e.full_name]));
  }, [evaluators]);

  const filteredProposals = useMemo(() => {
    if (!searchQuery) return proposals;
    const query = searchQuery.toLowerCase();
    return proposals.filter(
      (p) =>
        p.team_name.toLowerCase().includes(query) ||
        p.product_name.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );
  }, [proposals, searchQuery]);

  const topTeams = useMemo(() => {
    return proposals
      .filter((p) => p.is_graded)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 15);
  }, [proposals]);

  const handleDeleteProposal = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("proposals")
        .delete()
        .eq("id", deletingId);

      if (error) throw error;
      
      toast.success("Proposal deleted successfully");
      setDeletingId(null);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete proposal");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderBreakdownDialog = (proposal: Proposal, trigger: React.ReactNode, isIcon?: boolean) => {
    const criteriaData = (breakdownData[proposal.id] || []) as { name: string; max_score: number; scores: Record<string, number> }[];
    const assignedEvaluatorIds = assignments
      .filter((a) => a.proposal_id === proposal.id)
      .map((a) => a.evaluator_id);
    
    const assignedEvaluators = assignedEvaluatorIds.map(id => ({
      id,
      name: evaluatorMap.get(id) || "Unknown"
    }));

    // Calculate total score per evaluator
    const evaluatorTotals: Record<string, number> = {};
    assignedEvaluatorIds.forEach(evalId => {
      let total = 0;
      let hasAnyScore = false;
      criteriaData.forEach(c => {
        if (c.scores[evalId] !== undefined) {
          total += c.scores[evalId];
          hasAnyScore = true;
        }
      });
      if (hasAnyScore) evaluatorTotals[evalId] = total;
    });

    return (
      <Dialog>
        <DialogTrigger asChild>
          {isIcon ? (
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--bw-content-tertiary)",
                padding: 4,
                borderRadius: "var(--bw-radius-circle)",
                display: "flex",
              }}
            >
              {trigger}
            </button>
          ) : (
            trigger
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontSize: "var(--bw-fs-h4)" }}>
              Detailed Scores: {proposal.team_name}
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: "0 var(--bw-space-6) var(--bw-space-6)", display: "flex", flexDirection: "column", gap: "var(--bw-space-4)" }}>
            
            {/* Summary Row */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${assignedEvaluators.length + 1}, 1fr)`, gap: "var(--bw-space-2)", background: "var(--bw-chip)", padding: "var(--bw-space-3)", borderRadius: "var(--bw-radius-md)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)" }}>Average</span>
                <span style={{ fontSize: "var(--bw-fs-base)", fontWeight: "var(--bw-fw-bold)" as any }}>{proposal.total_score}/100</span>
              </div>
              {assignedEvaluators.map(evaluator => (
                <div key={evaluator.id} style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{evaluator.name}</span>
                  <span style={{ fontSize: "var(--bw-fs-base)", fontWeight: "var(--bw-fw-bold)" as any }}>
                    {evaluatorTotals[evaluator.id] !== undefined ? `${evaluatorTotals[evaluator.id]}/100` : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            {/* Detailed Table */}
            <div style={{ border: "1px solid var(--bw-border)", borderRadius: "var(--bw-radius-md)", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ fontSize: "var(--bw-fs-xs)", padding: "var(--bw-space-2) var(--bw-space-3)" }}>Criterion</TableHead>
                      {assignedEvaluators.map(e => (
                        <TableHead key={e.id} style={{ fontSize: "var(--bw-fs-xs)", textAlign: "center", padding: "var(--bw-space-2) var(--bw-space-3)" }}>{e.name}</TableHead>
                      ))}
                      <TableHead style={{ fontSize: "var(--bw-fs-xs)", textAlign: "right", padding: "var(--bw-space-2) var(--bw-space-3)" }}>Avg</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteriaData.length > 0 ? (
                      criteriaData.map((c, idx) => {
                        const scoresArr = assignedEvaluatorIds
                          .map(id => c.scores[id])
                          .filter(s => s !== undefined);
                        const avg = scoresArr.length > 0 
                          ? Math.round(scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length)
                          : null;

                        return (
                          <TableRow key={idx}>
                            <TableCell style={{ fontSize: "var(--bw-fs-xs)", padding: "var(--bw-space-2) var(--bw-space-3)" }}>
                              <div style={{ fontWeight: "var(--bw-fw-medium)" as any }}>{c.name}</div>
                              <div style={{ fontSize: "10px", color: "var(--bw-content-tertiary)" }}>Max: {c.max_score}</div>
                            </TableCell>
                            {assignedEvaluatorIds.map(evalId => (
                              <TableCell key={evalId} style={{ fontSize: "var(--bw-fs-xs)", textAlign: "center", padding: "var(--bw-space-2) var(--bw-space-3)" }}>
                                {c.scores[evalId] !== undefined ? c.scores[evalId] : <span style={{ color: "var(--bw-content-disabled)" }}>—</span>}
                              </TableCell>
                            ))}
                            <TableCell style={{ fontSize: "var(--bw-fs-xs)", textAlign: "right", fontWeight: "var(--bw-fw-bold)" as any, padding: "var(--bw-space-2) var(--bw-space-3)" }}>
                              {avg !== null ? avg : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={assignedEvaluators.length + 2} style={{ textAlign: "center", padding: "var(--bw-space-4)", color: "var(--bw-content-disabled)", fontStyle: "italic" }}>
                          No scoring data available yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)", borderTop: "1px solid var(--bw-border)", paddingTop: "var(--bw-space-4)" }}>
              {proposal.proposal_url && (
                <a href={proposal.proposal_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "flex-start" }}>
                    <FileText size={14} style={{ marginRight: 8 }} /> View Proposal PDF
                  </Button>
                </a>
              )}
              {proposal.video_url && (
                <a href={proposal.video_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "flex-start" }}>
                    <ExternalLink size={14} style={{ marginRight: 8 }} /> Watch Pitch Video
                  </Button>
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-6)" }}>
      {/* Page heading */}
      <div>
        <h2 style={{ fontFamily: "var(--bw-font-heading)", fontSize: "var(--bw-fs-h1)", fontWeight: "var(--bw-fw-bold)" as any, lineHeight: "var(--bw-lh-tight)" }}>
          Dashboard
        </h2>
        <p style={{ marginTop: "var(--bw-space-2)", fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-secondary)" }}>
          Overview of all ideasprint 2026 proposals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="flat">
              <CardHeader style={{ padding: "var(--bw-space-5) var(--bw-space-5) var(--bw-space-2)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "var(--bw-fs-xs)", fontWeight: "var(--bw-fw-medium)" as any, color: "var(--bw-content-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</span>
                  <Icon size={14} style={{ color: "var(--bw-content-disabled)" }} />
                </div>
              </CardHeader>
              <CardContent style={{ padding: "var(--bw-space-2) var(--bw-space-5) var(--bw-space-5)" }}>
                <div style={{ fontSize: "var(--bw-fs-h2)", fontWeight: "var(--bw-fw-bold)" as any }}>{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Split View: Table + Leaderboard */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Proposals Table */}
        <Card variant="flat" style={{ display: "flex", flexDirection: "column" }}>
          <CardHeader style={{ padding: "var(--bw-space-6)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--bw-space-4)" }}>
              <CardTitle style={{ fontSize: "var(--bw-fs-h4)" }}>Recent Proposals</CardTitle>
              <div style={{ position: "relative", width: "100%", maxWidth: 260 }}>
                <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--bw-content-disabled)" }} />
                <Input
                  type="search"
                  placeholder="Search team, product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 34 }}
                  pill
                />
              </div>
            </div>
          </CardHeader>
          <CardContent style={{ padding: "var(--bw-space-0) var(--bw-space-6) var(--bw-space-6)" }}>
            <div style={{ overflowX: "auto", margin: "0 calc(var(--bw-space-6) * -1)" }}>
              <Table style={{ minWidth: 800 }}>
                <TableHeader>
                  <TableRow>
                    <TableHead style={{ paddingLeft: "var(--bw-space-6)" }}>Team</TableHead>
                    <TableHead>Evaluators</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead style={{ textAlign: "right" }}>Total</TableHead>
                    <TableHead style={{ textAlign: "right", paddingRight: "var(--bw-space-6)" }}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProposals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} style={{ height: 96, textAlign: "center", color: "var(--bw-content-disabled)" }}>
                        No proposals found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProposals.map((proposal) => {
                      const assigneeIds = assignments
                        .filter((a) => a.proposal_id === proposal.id)
                        .map((a) => a.evaluator_id);

                      return (
                        <TableRow key={proposal.id}>
                          <TableCell style={{ paddingLeft: "var(--bw-space-6)" }}>
                            <div style={{ fontWeight: "var(--bw-fw-medium)" as any }}>{proposal.team_name}</div>
                            <div style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)" }}>{proposal.product_name}</div>
                          </TableCell>
                          <TableCell>
                            <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)" }}>
                              {assigneeIds.length > 0 ? (
                                assigneeIds.map((evalId) => (
                                  <div key={evalId} style={{ height: 24, display: "flex", alignItems: "center" }}>
                                    <span style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-secondary)" }}>
                                      {evaluatorMap.get(evalId) || "Unknown"}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-disabled)", fontStyle: "italic" }}>Unassigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)" }}>
                              {assigneeIds.map((evalId) => {
                                const criteriaData = (breakdownData[proposal.id] || []) as any[];
                                const hasGraded = criteriaData.some(c => c.scores[evalId] !== undefined);
                                return (
                                  <div key={evalId} style={{ height: 24, display: "flex", alignItems: "center" }}>
                                    <Badge variant={hasGraded ? "positive" : "secondary"}>
                                      {hasGraded ? "Graded" : "Pending"}
                                    </Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                          <TableCell style={{ textAlign: "right", fontWeight: "var(--bw-fw-bold)" as any }}>
                            {proposal.is_graded ? `${proposal.total_score}` : "—"}
                          </TableCell>
                          <TableCell style={{ textAlign: "right", paddingRight: "var(--bw-space-6)" }}>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--bw-space-2)" }}>
                              {proposal.is_graded ? (
                                renderBreakdownDialog(
                                  proposal,
                                  <Button variant="secondary" size="sm">Breakdown</Button>,
                                )
                              ) : (
                                <Button variant="ghost" size="sm" disabled style={{ color: "var(--bw-content-disabled)" }}>Pending</Button>
                              )}
                              <Button variant="destructive" size="sm" onClick={() => setDeletingId(proposal.id)}>Delete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Top 15 Leaderboard */}
        <div style={{ position: "sticky", top: "calc(var(--bw-nav-height) + var(--bw-space-6))", alignSelf: "start", maxHeight: "calc(100vh - var(--bw-nav-height) - var(--bw-space-12))", overflowY: "auto" }} className="hidden xl:block">
          <Card variant="flat" style={{ display: "flex", flexDirection: "column" }}>
            <CardHeader style={{ padding: "var(--bw-space-6)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-2)" }}>
                <Trophy size={18} style={{ color: "var(--bw-warning)" }} />
                <CardTitle style={{ fontSize: "var(--bw-fs-h4)" }}>Top 15 Teams</CardTitle>
              </div>
            </CardHeader>
            <CardContent style={{ padding: "0 var(--bw-space-6) var(--bw-space-6)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-4)" }}>
                {topTeams.length === 0 ? (
                  <div style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-disabled)", textAlign: "center", padding: "var(--bw-space-6) 0" }}>
                    No graded proposals yet.
                  </div>
                ) : (
                  topTeams.map((team, index) => {
                    const evaluatedByList = evaluatorByProposal[team.id] || [];
                    return (
                      <div key={team.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--bw-space-2)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-3)", minWidth: 0, flex: 1 }}>
                          {/* Rank badge */}
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "var(--bw-radius-circle)",
                              background: index < 3 ? "var(--bw-bg-inverse)" : "var(--bw-chip)",
                              color: index < 3 ? "var(--bw-content-inverse)" : "var(--bw-content-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: "var(--bw-fw-bold)" as any,
                              flexShrink: 0,
                            }}
                          >
                            {index + 1}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: "var(--bw-fs-sm)", fontWeight: "var(--bw-fw-medium)" as any, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.team_name}</p>
                            {evaluatedByList.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                                {evaluatedByList.map((name, i) => (
                                  <Badge key={i} variant="secondary" style={{ fontSize: "10px", padding: "0px 6px", height: 16 }}>{name}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-3)", flexShrink: 0 }}>
                          <span style={{ fontWeight: "var(--bw-fw-bold)" as any, fontSize: "var(--bw-fs-sm)" }}>{team.total_score}</span>
                          {renderBreakdownDialog(
                            team,
                            <BarChart size={14} />,
                            true
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
          </DialogHeader>
          <div style={{ padding: "0 var(--bw-space-6) var(--bw-space-6)" }}>
            <p style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-secondary)", marginBottom: "var(--bw-space-6)" }}>
              This action cannot be undone. This will permanently delete the proposal
              and all associated evaluations and assignments.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--bw-space-3)" }}>
              <Button variant="secondary" onClick={() => setDeletingId(null)} disabled={isDeleting}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteProposal} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete Proposal"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
