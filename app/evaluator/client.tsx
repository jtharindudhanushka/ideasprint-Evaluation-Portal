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
  Lock,
  ExternalLink,
  FileText,
  Search,
  Trophy,
  Edit,
  BarChart,
  Loader2,
} from "lucide-react";
import { isLockedByOther, timeAgo } from "@/lib/utils";
import type { Proposal, Profile } from "@/lib/types/database";
import Link from "next/link";
import { toast } from "sonner";

interface Props {
  proposals: Proposal[];
  currentUserId: string;
  gradedProposalIds: string[];
  profiles: Pick<Profile, "id" | "full_name">[];
  breakdownData?: Record<string, any[]>;
  serverNow?: string;
}

export function EvaluatorDashboardClient({
  proposals,
  currentUserId,
  gradedProposalIds,
  profiles,
  breakdownData = {},
  serverNow,
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

  const getLockerName = (lockedBy: string | null) => {
    if (!lockedBy) return "";
    const profile = profiles.find((p) => p.id === lockedBy);
    return profile?.full_name || "Another evaluator";
  };

  const getAssigneeName = (proposal: Proposal) => {
    if (!proposal.assigned_to) return null;
    const profile = profiles.find((p) => p.id === proposal.assigned_to);
    return profile?.full_name ?? null;
  };

  // Split proposals: mine vs others
  const myAssignments = useMemo(
    () => proposals.filter((p) => p.assigned_to === currentUserId),
    [proposals, currentUserId]
  );

  const allProposals = proposals;

  // Filter my assignments
  const filteredAssignments = useMemo(() => {
    let result = myAssignments;
    if (showOnlyPending) result = result.filter((p) => !p.is_graded);
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
  }, [myAssignments, searchQuery, showOnlyPending]);

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
    const marks = breakdownData[proposal.id] || [];

    return (
      <Dialog>
        <DialogTrigger className={triggerClassName}>
          {triggerContent}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Breakdown: {proposal.team_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between font-medium bg-muted/50 p-3 rounded-lg">
              <span>Total Score</span>
              <span className="text-xl font-bold">{proposal.total_score}/100</span>
            </div>

            {marks.length > 0 ? (
              <div className="space-y-2 border rounded-lg p-3">
                <h4 className="text-sm font-semibold mb-2">Rubric Scores</h4>
                {marks.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate pr-4">{m.name}</span>
                    <span className="font-medium whitespace-nowrap">
                      {m.score} / {m.max_score}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic mb-4">
                Detailed rubric scores are not available.
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
        <div className="grid gap-4 md:grid-cols-3">
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
                {myAssignments.filter((p) => !p.is_graded).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Split View */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: My Assignments + All Proposals stacked */}
          <div className="lg:col-span-2 space-y-6">

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
              <CardContent>
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
                        const lockedByOther = isLockedByOther(
                          proposal.locked_by,
                          proposal.locked_at,
                          currentUserId,
                          serverNow
                        );
                        const lockerName = getLockerName(proposal.locked_by);

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
                              {proposal.is_graded ? (
                                <Badge variant="default">Completed</Badge>
                              ) : navigatingTo === proposal.id ? (
                                <Badge variant="secondary" className="animate-pulse">
                                  Entering...
                                </Badge>
                              ) : lockedByOther ? (
                                <Badge variant="secondary">In Progress</Badge>
                              ) : (
                                <Badge variant="outline">Available</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {proposal.is_graded ? (
                                renderBreakdownDialog(
                                  proposal,
                                  "Breakdown",
                                  buttonVariants({ variant: "outline", size: "sm" })
                                )
                              ) : lockedByOther ? (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <span>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        disabled
                                        className="inline-flex items-center gap-1"
                                      >
                                        <Lock className="h-3 w-3" />
                                        Locked
                                      </Button>
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Currently being evaluated by {lockerName} (
                                    {timeAgo(proposal.locked_at!)})
                                  </TooltipContent>
                                </Tooltip>
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team &amp; Product</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Score / Breakdown</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAll.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No proposals found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAll.map((proposal) => {
                        const assigneeName = getAssigneeName(proposal);
                        const isMyProposal = proposal.assigned_to === currentUserId;
                        return (
                          <TableRow key={proposal.id} className={isMyProposal ? "bg-muted/20" : ""}>
                            <TableCell>
                              <div className="font-medium">{proposal.team_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {proposal.product_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {assigneeName ? (
                                <span className={`text-sm ${isMyProposal ? "font-semibold" : ""}`}>
                                  {isMyProposal ? "You" : assigneeName}
                                </span>
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
                                    : proposal.assigned_to
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {proposal.is_graded
                                  ? "Graded"
                                  : proposal.assigned_to
                                  ? "Assigned"
                                  : "Unassigned"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {proposal.is_graded ? (
                                renderBreakdownDialog(
                                  proposal,
                                  `${proposal.total_score} pts — View`,
                                  buttonVariants({ variant: "ghost", size: "sm" })
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
                  topTeams.map((team, index) => (
                    <div key={team.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">
                            {team.team_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
