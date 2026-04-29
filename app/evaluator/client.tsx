"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ClipboardCheck,
  ExternalLink,
  FileText,
  Search,
  Trophy,
  Edit,
  BarChart,
  Loader2,
  CalendarDays,
  Hourglass,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { OnboardingModal } from "@/components/onboarding-modal";
import type { Proposal, Profile, ProposalAssignment } from "@/lib/types/database";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  proposals: Proposal[];
  currentUserId: string;
  gradedProposalIds: string[];
  profiles: Pick<Profile, "id" | "full_name">[];
  breakdownData?: Record<string, any[]>;
  evaluatorByProposal?: Record<string, string[]>;
  scoresByProposal?: Record<string, Record<string, { name: string; total: number }>>;
  assignments: ProposalAssignment[];
  serverNow?: string;
  daysLeft?: string;
  hasSeenOnboarding?: boolean;
}

export function EvaluatorDashboardClient({
  proposals,
  currentUserId,
  gradedProposalIds,
  profiles,
  breakdownData,
  evaluatorByProposal = {},
  scoresByProposal = {},
  assignments = [],
  daysLeft = "14",
  hasSeenOnboarding = true,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryAll, setSearchQueryAll] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!hasSeenOnboarding);

  // All Proposals Pagination & Filter state
  const [allProposalsPage, setAllProposalsPage] = useState(1);
  const [allProposalsFilter, setAllProposalsFilter] = useState<"all" | "graded" | "assigned">("all");
  const [filterByEvaluator, setFilterByEvaluator] = useState<string>("all");
  const [showGradedOnly, setShowGradedOnly] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (searchParams.get("error") === "not_assigned") {
      toast.error("You are not assigned to evaluate that proposal.");
      router.replace("/evaluator");
    }
  }, [searchParams, router]);

  const handleEvaluate = (proposalId: string) => {
    setNavigatingTo(proposalId);
    router.push(`/evaluator/evaluate/${proposalId}`);
  };

  const evaluatorMap = useMemo(() => {
    return new Map(profiles.map((p) => [p.id, p.full_name]));
  }, [profiles]);

  const assigneesByProposal = useMemo(() => {
    const map: Record<string, string[]> = {};
    assignments.forEach(a => {
      if (!map[a.proposal_id]) map[a.proposal_id] = [];
      map[a.proposal_id].push(a.evaluator_id);
    });
    return map;
  }, [assignments]);

  const myAssignments = useMemo(
    () => proposals.filter((p) => assigneesByProposal[p.id]?.includes(currentUserId)),
    [proposals, assigneesByProposal, currentUserId]
  );

  const allProposals = proposals;

  const filteredAssignments = useMemo(() => {
    let result = myAssignments;
    if (showOnlyPending) result = result.filter((p) => !gradedProposalIds.includes(p.id));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.team_name.toLowerCase().includes(q) ||
          p.product_name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [myAssignments, searchQuery, showOnlyPending, gradedProposalIds]);

  const filteredAll = useMemo(() => {
    let result = allProposals;
    
    if (allProposalsFilter === "graded") {
      result = result.filter(p => p.is_graded);
    } else if (allProposalsFilter === "assigned") {
      result = result.filter(p => (assigneesByProposal[p.id] || []).length > 0);
    }

    if (showGradedOnly) {
      result = result.filter(p => p.is_graded);
    }

    if (filterByEvaluator !== "all") {
      result = result.filter(p => {
        const assignees = assigneesByProposal[p.id] || [];
        return assignees.includes(filterByEvaluator);
      });
    }
    
    if (searchQueryAll) {
      const q = searchQueryAll.toLowerCase();
      result = result.filter(
        (p) =>
          p.team_name.toLowerCase().includes(q) ||
          p.product_name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [allProposals, searchQueryAll, allProposalsFilter, showGradedOnly, filterByEvaluator, assigneesByProposal]);

  const paginatedAll = useMemo(() => {
    const start = (allProposalsPage - 1) * itemsPerPage;
    return filteredAll.slice(start, start + itemsPerPage);
  }, [filteredAll, allProposalsPage, itemsPerPage]);

  const totalAllPages = Math.ceil(filteredAll.length / itemsPerPage);

  // Unique evaluator names for filter dropdown
  const uniqueEvaluatorNames = useMemo(() => {
    const names: { id: string; name: string }[] = [];
    const seen = new Set<string>();
    profiles.forEach(p => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        names.push({ id: p.id, name: p.full_name });
      }
    });
    return names;
  }, [profiles]);

  // Reset page when filter or search changes
  useEffect(() => {
    setAllProposalsPage(1);
  }, [searchQueryAll, allProposalsFilter, showGradedOnly, filterByEvaluator]);

  const topTeams = useMemo(() => {
    return proposals
      .filter((p) => p.is_graded)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 15);
  }, [proposals]);

  const renderBreakdownDialog = (
    proposal: Proposal,
    triggerContent: React.ReactNode,
    isButton?: boolean
  ) => {
    const isGradedByMe = gradedProposalIds.includes(proposal.id);
    // Other evaluators' scores (privacy: only show total, never rubric)
    const otherEvalScores = Object.entries(scoresByProposal[proposal.id] ?? {})
      .filter(([evalId]) => evalId !== currentUserId);
    const myScore = scoresByProposal[proposal.id]?.[currentUserId];

    return (
      <Dialog>
        <DialogTrigger asChild>
          {isButton ? (
            <Button variant="secondary" size="sm">
              {triggerContent}
            </Button>
          ) : (
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
              {triggerContent}
            </button>
          )}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
          <DialogTitle style={{ fontSize: "var(--bw-fs-h4)" }}>{proposal.team_name}</DialogTitle>
          </DialogHeader>
          <div style={{ padding: "0 var(--bw-space-6) var(--bw-space-6)", display: "flex", flexDirection: "column", gap: "var(--bw-space-4)" }}>
            {/* Evaluators Status */}
            {(assigneesByProposal[proposal.id] || []).length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)" }}>
                <div style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)", fontWeight: "var(--bw-fw-medium)" as any }}>Evaluators Status</div>
                {/* My status row */}
                {(assigneesByProposal[proposal.id] || []).includes(currentUserId) && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--bw-space-2) var(--bw-space-3)", borderRadius: "var(--bw-radius-sm)", background: "var(--bw-hover-light)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-2)" }}>
                      <span style={{ fontSize: "var(--bw-fs-sm)", fontWeight: "var(--bw-fw-medium)" as any }}>You</span>
                    </div>
                    {isGradedByMe && myScore ? (
                      <Badge variant="positive">Graded ({myScore.total}/100)</Badge>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                )}
                {/* Other evaluators — status only */}
                {(assigneesByProposal[proposal.id] || []).filter(id => id !== currentUserId).map((evalId) => {
                  const name = evaluatorMap.get(evalId) || "Unknown";
                  const hasGraded = !!scoresByProposal[proposal.id]?.[evalId];
                  return (
                    <div key={evalId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--bw-space-2) var(--bw-space-3)", borderRadius: "var(--bw-radius-sm)", border: "1px solid var(--bw-border)" }}>
                      <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-secondary)" }}>{name}</span>
                      <Badge variant={hasGraded ? "positive" : "secondary"}>
                        {hasGraded ? "Graded" : "Pending"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full rubric — only for own evaluation */}
            {isGradedByMe && breakdownData?.[proposal.id] && (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)", borderTop: "1px solid var(--bw-border)", paddingTop: "var(--bw-space-4)" }}>
                <div style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)", marginBottom: "var(--bw-space-1)" }}>Your Rubric Breakdown</div>
                {breakdownData[proposal.id].map((criterion, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--bw-fs-sm)", padding: "var(--bw-space-2) 0", borderBottom: i < breakdownData![proposal.id].length - 1 ? "1px dashed var(--bw-border)" : "none" }}>
                    <span style={{ color: "var(--bw-content-secondary)", paddingRight: 16 }}>{criterion.name}</span>
                    <span style={{ fontWeight: "var(--bw-fw-medium)" as any }}>{criterion.score}/{criterion.max_score}</span>
                  </div>
                ))}
              </div>
            )}

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
              {isGradedByMe && (
                <Link href={`/evaluator/evaluate/${proposal.id}`}>
                  <Button size="sm" style={{ width: "100%", justifyContent: "flex-start", marginTop: "var(--bw-space-2)" }}>
                    <Edit size={14} style={{ marginRight: 8 }} /> Edit Grading
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <TooltipProvider>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-6)" }}>
        <div>
          <h2 style={{ fontFamily: "var(--bw-font-heading)", fontSize: "clamp(1.5rem, 5vw, var(--bw-fs-h1))", fontWeight: "var(--bw-fw-bold)" as any, lineHeight: "var(--bw-lh-tight)" }}>Evaluator Dashboard</h2>
          <p style={{ marginTop: "var(--bw-space-2)", fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-secondary)" }}>
            Review and evaluate ideasprint 2026 proposals
          </p>
        </div>

        {/* Main Grid: Left (Cards + Assignments + All Proposals) | Right (Top 15) */}
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* LEFT COLUMN: cards + stacked tables */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-6)" }}>
            {/* Quick Stats — Modern Icon Cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          {/* My Assignments */}
          <Card variant="flat" style={{ overflow: "hidden", position: "relative" }}>
            <CardContent style={{ padding: "var(--bw-space-5)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "var(--bw-fs-xs)", fontWeight: "var(--bw-fw-medium)" as any, color: "var(--bw-content-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--bw-space-2)" }}>My Assignments</p>
                  <p style={{ fontSize: 32, fontWeight: "var(--bw-fw-bold)" as any, lineHeight: 1, letterSpacing: "-0.02em" }}>{myAssignments.length}</p>
                  <p style={{ fontSize: "10px", color: "var(--bw-content-tertiary)", marginTop: "var(--bw-space-1)" }}>proposals to review</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bw-chip)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <ClipboardCheck size={18} style={{ color: "var(--bw-content-primary)" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remaining */}
          <Card variant="flat" style={{ overflow: "hidden", position: "relative" }}>
            <CardContent style={{ padding: "var(--bw-space-5)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "var(--bw-fs-xs)", fontWeight: "var(--bw-fw-medium)" as any, color: "var(--bw-content-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--bw-space-2)" }}>Remaining</p>
                  <p style={{ fontSize: 32, fontWeight: "var(--bw-fw-bold)" as any, lineHeight: 1, letterSpacing: "-0.02em", color: myAssignments.filter(p => !gradedProposalIds.includes(p.id)).length > 0 ? "var(--bw-warning)" : "var(--bw-content-primary)" }}>
                    {myAssignments.filter((p) => !gradedProposalIds.includes(p.id)).length}
                  </p>
                  <p style={{ fontSize: "10px", color: "var(--bw-content-tertiary)", marginTop: "var(--bw-space-1)" }}>yet to grade</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bw-chip)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Hourglass size={18} style={{ color: "var(--bw-content-primary)" }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Days Left */}
          {(() => {
            const days = parseInt(daysLeft) || 0;
            const isUrgent = days <= 3;
            return (
              <Card variant="flat" style={{ overflow: "hidden", position: "relative" }}>
                <CardContent style={{ padding: "var(--bw-space-5)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontSize: "var(--bw-fs-xs)", fontWeight: "var(--bw-fw-medium)" as any, color: "var(--bw-content-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--bw-space-2)" }}>Days Left</p>
                      <p style={{ fontSize: 32, fontWeight: "var(--bw-fw-bold)" as any, lineHeight: 1, letterSpacing: "-0.02em", color: isUrgent ? "var(--bw-negative)" : "var(--bw-content-primary)" }}>{daysLeft}</p>
                      <p style={{ fontSize: "10px", color: "var(--bw-content-tertiary)", marginTop: "var(--bw-space-1)" }}>until deadline</p>
                    </div>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bw-chip)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CalendarDays size={18} style={{ color: "var(--bw-content-primary)" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
        </div>

{/* Table 1: My Assignments */}
          <Card variant="flat" style={{ display: "flex", flexDirection: "column" }}>
              <CardHeader style={{ padding: "var(--bw-space-6)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--bw-space-4)" }}>
                  <CardTitle style={{ fontSize: "var(--bw-fs-h4)" }}>My Assignments</CardTitle>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--bw-space-4)", width: "100%", maxWidth: 400 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-2)", marginLeft: "auto" }}>
                      <label htmlFor="pending-toggle" style={{ fontSize: "var(--bw-fs-xs)", fontWeight: "var(--bw-fw-medium)" as any, cursor: "pointer", userSelect: "none", color: "var(--bw-content-secondary)" }}>
                        Show Pending
                      </label>
                      <button
                        id="pending-toggle"
                        type="button"
                        role="switch"
                        aria-checked={showOnlyPending}
                        onClick={() => setShowOnlyPending(!showOnlyPending)}
                        style={{
                          width: 32,
                          height: 18,
                          borderRadius: 20,
                          background: showOnlyPending ? "var(--bw-black)" : "var(--bw-chip)",
                          border: "none",
                          position: "relative",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: showOnlyPending ? 16 : 2,
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: showOnlyPending ? "var(--bw-white)" : "var(--bw-content-tertiary)",
                            transition: "left 0.2s ease",
                          }}
                        />
                      </button>
                    </div>
                    <div style={{ position: "relative", flex: 1, minWidth: 150 }}>
                      <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--bw-content-disabled)" }} />
                      <Input
                        type="search"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: 34 }}
                        pill
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent style={{ padding: "0 var(--bw-space-6) var(--bw-space-6)" }}>
                <div style={{ overflowX: "auto", margin: "0 calc(var(--bw-space-6) * -1)" }}>
                <Table style={{ minWidth: 700 }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ paddingLeft: "var(--bw-space-6)" }}>Team &amp; Product</TableHead>
                      <TableHead>Links</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead style={{ textAlign: "right", paddingRight: "var(--bw-space-6)" }}>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} style={{ height: 96, textAlign: "center", color: "var(--bw-content-disabled)" }}>
                          {myAssignments.length === 0
                            ? "No proposals have been assigned to you yet."
                            : "No matching proposals."}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssignments.map((proposal) => {
                        const isGradedByMe = gradedProposalIds.includes(proposal.id);

                        return (
                          <TableRow key={proposal.id}>
                            <TableCell>
                              <div style={{ fontWeight: "var(--bw-fw-medium)" as any }}>{proposal.team_name}</div>
                              <div style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)" }}>
                                {proposal.product_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div style={{ display: "flex", gap: "var(--bw-space-2)" }}>
                                {proposal.proposal_url && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a
                                        href={proposal.proposal_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "inline-flex", padding: 6, borderRadius: "var(--bw-radius-circle)", border: "1px solid var(--bw-border)", color: "var(--bw-content-secondary)", textDecoration: "none" }}
                                      >
                                        <FileText size={14} />
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>View Proposal PDF</TooltipContent>
                                  </Tooltip>
                                )}
                                {proposal.video_url && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <a
                                        href={proposal.video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "inline-flex", padding: 6, borderRadius: "var(--bw-radius-circle)", border: "1px solid var(--bw-border)", color: "var(--bw-content-secondary)", textDecoration: "none" }}
                                      >
                                        <ExternalLink size={14} />
                                      </a>
                                    </TooltipTrigger>
                                    <TooltipContent>Watch Pitch Video</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isGradedByMe ? (
                                <Badge variant="positive">Completed</Badge>
                              ) : navigatingTo === proposal.id ? (
                                <Badge variant="secondary" style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
                                  Entering...
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Available</Badge>
                              )}
                            </TableCell>
                            <TableCell style={{ textAlign: "right", paddingRight: "var(--bw-space-6)" }}>
                              {isGradedByMe ? (
                                renderBreakdownDialog(proposal, "Details", true)
                              ) : (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={navigatingTo === proposal.id}
                                  onClick={() => handleEvaluate(proposal.id)}
                                >
                                  {navigatingTo === proposal.id ? (
                                    <Loader2 size={14} style={{ marginRight: 6, animation: "spin 1s linear infinite" }} />
                                  ) : (
                                    <ClipboardCheck size={14} style={{ marginRight: 6 }} />
                                  )}
                                  {navigatingTo === proposal.id ? "Loading..." : "Evaluate"}
                                </Button>
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

{/* Table 2: All Proposals */}
            <Card variant="flat">
              <CardHeader style={{ padding: "var(--bw-space-6)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "var(--bw-space-3)" }}>
                  <div>
                    <CardTitle style={{ fontSize: "var(--bw-fs-h4)" }}>All Proposals</CardTitle>
                    <p style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)", marginTop: "var(--bw-space-1)" }}>
                      View-only — shows who is assigned and current scores
                    </p>
                  </div>
                </div>
                {/* Inline filters row */}
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--bw-space-3)", marginTop: "var(--bw-space-3)" }}>
                  {/* Search — grows to fill available space, min-w-0 prevents overflow */}
                  <div style={{ position: "relative", flex: "1 1 140px", minWidth: 0 }}>
                    <Search size={16} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--bw-content-disabled)", pointerEvents: "none" }} />
                    <Input type="search" placeholder="Search teams..." value={searchQueryAll} onChange={(e) => setSearchQueryAll(e.target.value)} style={{ paddingLeft: 34, minHeight: 44 }} pill />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-2)", flexShrink: 0 }}>
                    <label htmlFor="graded-toggle" style={{ fontSize: "var(--bw-fs-xs)", fontWeight: "var(--bw-fw-medium)" as any, cursor: "pointer", userSelect: "none", color: "var(--bw-content-secondary)", whiteSpace: "nowrap" }}>Graded only</label>
                    <button id="graded-toggle" type="button" role="switch" aria-checked={showGradedOnly} onClick={() => setShowGradedOnly(!showGradedOnly)} style={{ width: 36, height: 20, borderRadius: 20, background: showGradedOnly ? "var(--bw-black)" : "var(--bw-chip)", border: "none", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                      <span style={{ position: "absolute", top: 3, left: showGradedOnly ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: showGradedOnly ? "var(--bw-white)" : "var(--bw-content-tertiary)", transition: "left 0.2s ease" }} />
                    </button>
                  </div>
                  {/* Evaluator filter — shrinks on mobile, full-width on its own row when wrapping */}
                  <div style={{ position: "relative", flex: "1 1 140px", minWidth: 0 }}>
                    <select value={filterByEvaluator} onChange={(e) => setFilterByEvaluator(e.target.value)} style={{ appearance: "none", fontSize: "var(--bw-fs-xs)", fontWeight: "var(--bw-fw-medium)" as any, padding: "6px 28px 6px 12px", borderRadius: "var(--bw-radius-pill)", border: "1px solid var(--bw-border)", background: "var(--bw-bg-primary)", color: "var(--bw-content-primary)", cursor: "pointer", outline: "none", width: "100%", minHeight: 44 }}>
                      <option value="all">All Evaluators</option>
                      {uniqueEvaluatorNames.map(e => (<option key={e.id} value={e.id}>{e.name}</option>))}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--bw-content-secondary)" }} />
                  </div>
                </div>
              </CardHeader>
              <CardContent style={{ padding: "0 var(--bw-space-6) var(--bw-space-6)" }}>
                <div style={{ overflowX: "auto", margin: "0 calc(var(--bw-space-6) * -1)" }}>
                <Table style={{ minWidth: 800 }}>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{ paddingLeft: "var(--bw-space-6)" }}>Team &amp; Product</TableHead>
                      <TableHead>Evaluators</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead style={{ textAlign: "right", paddingRight: "var(--bw-space-6)" }}>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedAll.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} style={{ height: 96, textAlign: "center", color: "var(--bw-content-disabled)" }}>
                          No proposals found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedAll.map((proposal) => {
                        const assigneeIds = assigneesByProposal[proposal.id] || [];
                        const isMyProposal = assigneeIds.includes(currentUserId);
                        const isAssigned = assigneeIds.length > 0;
                        const assigneeNames = assigneeIds.map(id => evaluatorMap.get(id) || "Unknown");

                        return (
                          <TableRow key={proposal.id} style={{ backgroundColor: isMyProposal ? "var(--bw-hover-light)" : "transparent" }}>
                            <TableCell>
                              <div style={{ fontWeight: "var(--bw-fw-medium)" as any }}>{proposal.team_name}</div>
                              <div style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)" }}>{proposal.product_name}</div>
                            </TableCell>
                            <TableCell>
                              {isAssigned ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)" }}>
                                  {assigneeIds.map((evalId) => {
                                    const isMe = evalId === currentUserId;
                                    const name = isMe ? "You" : (evaluatorMap.get(evalId) || "Unknown");
                                    return (
                                      <div key={evalId} style={{ display: "flex", alignItems: "center", height: 24 }}>
                                        <span style={{ fontSize: "var(--bw-fs-xs)", color: isMe ? "var(--bw-content-primary)" : "var(--bw-content-secondary)", fontWeight: isMe ? "var(--bw-fw-bold)" as any : "var(--bw-fw-normal)" as any }}>
                                          {name}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-disabled)", fontStyle: "italic" }}>Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {isAssigned ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-2)" }}>
                                  {assigneeIds.map((evalId) => {
                                    const hasGraded = !!scoresByProposal[proposal.id]?.[evalId];
                                    return (
                                      <div key={evalId} style={{ display: "flex", alignItems: "center", height: 24 }}>
                                        <Badge variant={hasGraded ? "positive" : "secondary"}>
                                          {hasGraded ? "Graded" : "Pending"}
                                        </Badge>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                            </TableCell>
                            <TableCell style={{ textAlign: "right", paddingRight: "var(--bw-space-6)" }}>
                              {renderBreakdownDialog(proposal, <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><BarChart size={14} />View</span>, true)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                </div>
                {totalAllPages > 1 && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--bw-space-4)", padding: "var(--bw-space-4)", borderTop: "1px solid var(--bw-border)" }}>
                    <Button variant="secondary" size="sm" onClick={() => setAllProposalsPage(p => Math.max(1, p - 1))} disabled={allProposalsPage === 1}>Previous</Button>
                    <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-secondary)" }}>Page {allProposalsPage} of {totalAllPages}</span>
                    <Button variant="secondary" size="sm" onClick={() => setAllProposalsPage(p => Math.min(totalAllPages, p + 1))} disabled={allProposalsPage === totalAllPages}>Next</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Top 15 Teams (sticky sidebar) */}
          <div style={{ position: "sticky", top: 72, alignSelf: "start", maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
            <Card className="bw-card--flat" style={{ display: "flex", flexDirection: "column" }}>
              <CardHeader>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-2)" }}>
                  <Trophy size={18} style={{ color: "var(--bw-warning)" }} />
                  <CardTitle style={{ fontSize: "var(--bw-fs-h4)" }}>Top 15 Teams</CardTitle>
                </div>
                <p style={{ fontSize: "var(--bw-fs-xs)", color: "var(--bw-content-tertiary)", marginTop: "var(--bw-space-1)" }}>
                  Based on average marks. Not your individual marks.
                </p>
              </CardHeader>
              <CardContent>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--bw-space-3)" }}>
                  {topTeams.length === 0 ? (
                    <div style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-disabled)", textAlign: "center", padding: "var(--bw-space-6) 0" }}>No graded proposals yet.</div>
                  ) : (
                    Array.from({ length: 15 }).map((_, index) => {
                      const team = topTeams[index];
                      if (!team) {
                        return (
                          <div key={`empty-${index}`} style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-3)", padding: "var(--bw-space-2) var(--bw-space-3)", borderRadius: "var(--bw-radius-md)", border: "1px dashed var(--bw-border)", opacity: 0.4 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "var(--bw-radius-circle)", background: "var(--bw-chip)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "var(--bw-content-disabled)" }}>{index + 1}</div>
                            <span style={{ fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-disabled)" }}>---</span>
                          </div>
                        );
                      }
                      const evaluatedByList = evaluatorByProposal[team.id] || [];
                      return (
                        <div key={team.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--bw-space-2)", padding: "var(--bw-space-2) var(--bw-space-3)", borderRadius: "var(--bw-radius-md)", border: "1px solid var(--bw-border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-3)", minWidth: 0, flex: 1 }}>
                            <div style={{ width: 24, height: 24, borderRadius: "var(--bw-radius-circle)", background: "var(--bw-chip)", color: "var(--bw-content-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "var(--bw-fw-medium)" as any, flexShrink: 0 }}>{index + 1}</div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: "var(--bw-fs-sm)", fontWeight: "var(--bw-fw-medium)" as any, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{team.team_name}</p>
                              {evaluatedByList.length > 0 && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                                  {evaluatedByList.map((name, i) => (
                                    <span key={i} style={{ fontSize: "10px", color: "var(--bw-content-secondary)" }}>{name}{i < evaluatedByList.length - 1 ? "," : ""}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--bw-space-2)", flexShrink: 0 }}>
                            <span style={{ fontWeight: "var(--bw-fw-medium)" as any, fontSize: "var(--bw-fs-sm)", color: "var(--bw-content-primary)" }}>{team.total_score}</span>
                            {renderBreakdownDialog(team, <BarChart size={14} />, false)}
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
        <OnboardingModal 
          isOpen={isOnboardingOpen} 
          onClose={() => setIsOnboardingOpen(false)} 
          currentUserId={currentUserId}
        />
      </div>
    </TooltipProvider>
  );
}
