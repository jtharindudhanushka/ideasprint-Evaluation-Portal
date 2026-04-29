"use client";

import { useState, useMemo } from "react";
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

  const renderBreakdownDialog = (proposal: Proposal, trigger: React.ReactNode, isIcon?: boolean) => {
    const marks = breakdownData[proposal.id] || [];
    const evaluatedByList = evaluatorByProposal[proposal.id] || [];

    return (
      <Dialog>
        <DialogTrigger style={isIcon ? { background: "none", border: "none", cursor: "pointer", color: "var(--bw-content-tertiary)", padding: 4, borderRadius: "var(--bw-radius-circle)", display: "flex" } : undefined}>
          {trigger}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontSize: "var(--bw-fs-h4)" }}>
              Grade Breakdown: {proposal.team_name}
            </DialogTitle>
          </DialogHeader>
          <div style={{ padding: "0 var(--bw-space-6) var(--bw-space-6)", display: "flex", flexDirection: "column", gap: "var(--bw-space-4)" }}>
            {/* Total score */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--bw-chip)",
                padding: "var(--bw-space-3) var(--bw-space-4)",
                borderRadius: "var(--bw-radius-md)",
              }}
            >
              <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-secondary)" }}>Total Score (Average)</span>
              <span style={{ fontSize: "var(--bw-fs-h3)", fontWeight: "var(--bw-fw-bold)" as any }}>{proposal.total_score}/100</span>
            </div>

            {/* Evaluated by */}
            {evaluatedByList.length > 0 && (
              <div>
                <div style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)", marginBottom: "var(--bw-space-2)" }}>Evaluated by</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--bw-space-2)" }}>
                  {evaluatedByList.map((name, i) => (
                    <Badge key={i} variant="secondary">{name}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rubric scores */}
            {marks.length > 0 ? (
              <div style={{ border: "1px solid var(--bw-border)", borderRadius: "var(--bw-radius-md)", padding: "var(--bw-space-4)" }}>
                <h4 style={{ fontSize: "var(--bw-fs-sm)", fontWeight: "var(--bw-fw-medium)" as any, marginBottom: "var(--bw-space-3)" }}>Average Rubric Scores</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)" }}>
                  {marks.map((m, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--bw-fs-sm)" }}>
                      <span style={{ color: "var(--bw-content-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "var(--bw-space-4)" }}>{m.name}</span>
                      <span style={{ fontWeight: "var(--bw-fw-medium)" as any, whiteSpace: "nowrap" }}>{m.score} / {m.max_score}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-tertiary)", fontStyle: "italic" }}>
                Detailed rubric scores are not available.
              </div>
            )}

            {/* Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)", borderTop: "1px solid var(--bw-border)", paddingTop: "var(--bw-space-4)" }}>
              {proposal.proposal_url && (
                <a href={proposal.proposal_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "flex-start" }}>
                    <FileText size={14} /> View Proposal PDF
                  </Button>
                </a>
              )}
              {proposal.video_url && (
                <a href={proposal.video_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" style={{ width: "100%", justifyContent: "flex-start" }}>
                    <ExternalLink size={14} /> Watch Pitch Video
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
                    <TableHead>Assigned To</TableHead>
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
                      const assignees = assignments
                        .filter((a) => a.proposal_id === proposal.id)
                        .map((a) => evaluatorMap.get(a.evaluator_id) || "Unknown");

                      return (
                        <TableRow key={proposal.id}>
                          <TableCell style={{ paddingLeft: "var(--bw-space-6)" }}>
                            <div style={{ fontWeight: "var(--bw-fw-medium)" as any }}>{proposal.team_name}</div>
                            <div style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)" }}>{proposal.product_name}</div>
                          </TableCell>
                          <TableCell>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {assignees.length > 0 ? (
                                assignees.map((name, i) => (
                                  <Badge key={i} variant="outline">{name}</Badge>
                                ))
                              ) : (
                                <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-disabled)", fontStyle: "italic" }}>Unassigned</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={proposal.is_graded ? "positive" : "secondary"}>
                              {proposal.is_graded ? "Graded" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell style={{ textAlign: "right", fontWeight: "var(--bw-fw-bold)" as any }}>
                            {proposal.is_graded ? `${proposal.total_score}` : "—"}
                          </TableCell>
                          <TableCell style={{ textAlign: "right", paddingRight: "var(--bw-space-6)" }}>
                            {proposal.is_graded ? (
                              renderBreakdownDialog(
                                proposal,
                                <Button variant="secondary" size="sm">Breakdown</Button>,
                              )
                            ) : (
                              <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-disabled)" }}>Pending</span>
                            )}
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
    </div>
  );
}
