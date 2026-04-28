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
import { Button, buttonVariants } from "@/components/ui/button";
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
} from "lucide-react";
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
  assignments: ProposalAssignment[];
  serverNow?: string;
}

export function EvaluatorDashboardClient({
  proposals,
  currentUserId,
  gradedProposalIds,
  profiles,
  evaluatorByProposal = {},
  assignments = [],
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryAll, setSearchQueryAll] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Show error toast if redirected from evaluate page due to non-assignment
  useEffect(() => {
    if (searchParams.get("error") === "not_assigned") {
      toast.error("You are not assigned to evaluate that proposal.");
      // Clean up the URL
      router.replace("/evaluator");
    }
  }, [searchParams, router]);

  const handleEvaluate = (proposalId: string) => {
    setNavigatingTo(proposalId);
    router.push(`/evaluator/evaluate/${proposalId}`);
  };

  // Map proposal to its assigned evaluators
  const assigneesByProposal = useMemo(() => {
    const map: Record<string, string[]> = {};
    assignments.forEach(a => {
      if (!map[a.proposal_id]) map[a.proposal_id] = [];
      map[a.proposal_id].push(a.evaluator_id);
    });
    return map;
  }, [assignments]);

  // Split proposals: mine vs others
  const myAssignments = useMemo(
    () => proposals.filter((p) => assigneesByProposal[p.id]?.includes(currentUserId)),
    [proposals, assigneesByProposal, currentUserId]
  );

  const allProposals = proposals;

  // Filter my assignments
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

  // Filter all proposals table
  const filteredAll = useMemo(() => {
    if (!searchQueryAll) return allProposals;
    const q = searchQueryAll.toLowerCase();
    return allProposals.filter(
      (p) =>
        p.team_name.toLowerCase().includes(q) ||
        p.product_name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [allProposals, searchQueryAll]);

  // Top 15 Teams
  const topTeams = useMemo(() => {
    return proposals
      .filter((p) => p.is_graded)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 15);
  }, [proposals]);

  const renderBreakdownDialog = (
    proposal: Proposal,
    triggerContent: React.ReactNode,
    triggerClassName: string
  ) => {
    const isGradedByMe = gradedProposalIds.includes(proposal.id);
    const evaluatedByList = evaluatorByProposal[proposal.id] || [];

    return (
      <Dialog>
        <DialogTrigger className={triggerClassName}>
          {triggerContent}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Details: {proposal.team_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between font-medium bg-muted/50 p-3 rounded-lg">
              <span>Total Score</span>
              <span className="text-xl font-bold">{proposal.total_score}/100</span>
            </div>

            {evaluatedByList.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Evaluated by</span>
                <div className="flex flex-wrap gap-1.5">
                  {evaluatedByList.map((name, i) => (
                    <span key={i} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t">
              {proposal.proposal_url && (
                <a
                  href={proposal.proposal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-start",
                  })}
                >
                  <FileText className="mr-2 h-4 w-4" /> View Proposal PDF
                </a>
              )}
              {proposal.video_url && (
                <a
                  href={proposal.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full justify-start",
                  })}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Watch Pitch Video
                </a>
              )}
              {isGradedByMe && (
                <Link
                  href={`/evaluator/evaluate/${proposal.id}`}
                  className={buttonVariants({
                    variant: "default",
                    className: "w-full justify-start mt-2",
                  })}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit Grading
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
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Evaluator Dashboard</h2>
          <p className="text-muted-foreground mt-2">
            Review and evaluate ideasprint 2026 proposals
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myAssignments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluated by You</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gradedProposalIds.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myAssignments.filter((p) => !gradedProposalIds.includes(p.id)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Split View */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* LEFT: My Assignments + All Proposals stacked */}
          <div className="xl:col-span-2 space-y-6">

            {/* Table 1: My Assignments */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>My Assignments</CardTitle>
                  <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Pending toggle */}
                    <div className="flex items-center gap-3">
                      <label
                        htmlFor="pending-toggle"
                        className="text-sm font-medium cursor-pointer select-none"
                      >
                        Show Pending Only
                      </label>
                      <button
                        id="pending-toggle"
                        type="button"
                        role="switch"
                        aria-checked={showOnlyPending}
                        onClick={() => setShowOnlyPending(!showOnlyPending)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          showOnlyPending
                            ? "bg-primary"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                      >
                        <span className="sr-only">Show pending only</span>
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            showOnlyPending ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-background pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team &amp; Product</TableHead>
                      <TableHead>Links</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
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
                              <div className="font-medium">{proposal.team_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {proposal.product_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {proposal.proposal_url && (
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <a
                                          href={proposal.proposal_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={buttonVariants({
                                            variant: "outline",
                                            size: "icon",
                                            className: "h-8 w-8",
                                          })}
                                        />
                                      }
                                    >
                                      <FileText className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>View Proposal PDF</TooltipContent>
                                  </Tooltip>
                                )}
                                {proposal.video_url && (
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <a
                                          href={proposal.video_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className={buttonVariants({
                                            variant: "outline",
                                            size: "icon",
                                            className: "h-8 w-8",
                                          })}
                                        />
                                      }
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </TooltipTrigger>
                                    <TooltipContent>Watch Pitch Video</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isGradedByMe ? (
                                <Badge variant="default">Completed</Badge>
                              ) : navigatingTo === proposal.id ? (
                                <Badge variant="secondary" className="animate-pulse">
                                  Entering...
                                </Badge>
                              ) : (
                                <Badge variant="outline">Available</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isGradedByMe ? (
                                renderBreakdownDialog(
                                  proposal,
                                  "Details",
                                  buttonVariants({ variant: "outline", size: "sm" })
                                )
                              ) : (
                                <Button
                                  size="sm"
                                  disabled={navigatingTo === proposal.id}
                                  className="inline-flex items-center gap-1"
                                  onClick={() => handleEvaluate(proposal.id)}
                                >
                                  {navigatingTo === proposal.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <ClipboardCheck className="h-3 w-3" />
                                  )}
                                  {navigatingTo === proposal.id
                                    ? "Loading..."
                                    : "Evaluate"}
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

            {/* Table 2: All Proposals (view-only) */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>All Proposals</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      View-only — shows who is assigned and current scores
                    </p>
                  </div>
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full bg-background pl-8"
                      value={searchQueryAll}
                      onChange={(e) => setSearchQueryAll(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-0 sm:px-6">
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team &amp; Product</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Marks</TableHead>
                      <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAll.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No proposals found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAll.map((proposal) => {
                        const assigneeIds = assigneesByProposal[proposal.id] || [];
                        const isMyProposal = assigneeIds.includes(currentUserId);
                        const isAssigned = assigneeIds.length > 0;
                        const assigneeNames = assigneeIds.map(id => profiles.find(p => p.id === id)?.full_name || "Unknown");

                        return (
                          <TableRow key={proposal.id} className={isMyProposal ? "bg-muted/20" : ""}>
                            <TableCell>
                              <div className="font-medium">{proposal.team_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {proposal.product_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {isAssigned ? (
                                <div className="flex flex-wrap gap-1">
                                  {assigneeNames.map((name, i) => (
                                    <span key={i} className={`text-sm ${isMyProposal && assigneeIds[i] === currentUserId ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                                      {isMyProposal && assigneeIds[i] === currentUserId ? "You" : name}{i < assigneeNames.length - 1 ? "," : ""}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground italic">
                                  Unassigned
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  proposal.is_graded
                                    ? "default"
                                    : isAssigned
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {proposal.is_graded
                                  ? "Graded"
                                  : isAssigned
                                  ? "Assigned"
                                  : "Unassigned"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {proposal.is_graded ? (
                                <span className="font-bold">{proposal.total_score}<span className="text-muted-foreground font-normal text-xs">/100</span></span>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {proposal.is_graded ? (
                                renderBreakdownDialog(
                                  proposal,
                                  <span className="inline-flex items-center gap-1"><BarChart className="h-3.5 w-3.5" />View</span>,
                                  buttonVariants({ variant: "outline", size: "sm" })
                                )
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
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
          </div>

          {/* RIGHT: Top 15 Teams */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Top 15 Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTeams.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No graded proposals yet.
                  </div>
                ) : (
                  topTeams.map((team, index) => {
                    const evaluatedByList = evaluatorByProposal[team.id] || [];
                    return (
                    <div key={team.id} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-none truncate">
                            {team.team_name}
                          </p>
                          {evaluatedByList.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {evaluatedByList.map((name, i) => (
                                <span key={i} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  {name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <div className="font-bold">{team.total_score}</div>
                        {renderBreakdownDialog(
                          team,
                          <BarChart className="h-4 w-4" />,
                          buttonVariants({
                            variant: "ghost",
                            size: "icon",
                            className: "h-8 w-8 text-muted-foreground",
                          })
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
    </TooltipProvider>
  );
}
