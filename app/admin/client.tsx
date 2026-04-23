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
import { Button, buttonVariants } from "@/components/ui/button";
import { LayoutDashboard, Trophy, Clock, FileText, Search, ExternalLink, Edit, BarChart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Proposal, Profile } from "@/lib/types/database";
import Link from "next/link";

interface Props {
  proposals: Proposal[];
  breakdownData?: Record<string, any[]>;
  evaluators?: Pick<Profile, "id" | "full_name">[];
}

export function AdminDashboardClient({ proposals, breakdownData = {}, evaluators = [] }: Props) {
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

  // Search logic
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

  // Top 15 Teams logic
  const topTeams = useMemo(() => {
    return proposals
      .filter((p) => p.is_graded)
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 15);
  }, [proposals]);

  const renderBreakdownDialog = (proposal: Proposal, triggerContent: React.ReactNode, triggerClassName: string) => {
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
                    <span className="font-medium whitespace-nowrap">{m.score} / {m.max_score}</span>
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
                  className={buttonVariants({ variant: "outline", className: "w-full justify-start" })}
                >
                  <FileText className="mr-2 h-4 w-4" /> View Proposal PDF
                </a>
              )}
              {proposal.video_url && (
                <a 
                  href={proposal.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", className: "w-full justify-start" })}
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Watch Pitch Video
                </a>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of all ideasprint 2026 proposals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Split View */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Proposals List (Left) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Recent Proposals</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search team, product..."
                  className="w-full bg-background pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Team</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No proposals found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProposals.map((proposal) => {
                    const assignee = evaluators.find(
                      (e) => e.id === proposal.assigned_to
                    );
                    const ap = (proposal as any).assigned_profile;
                    const assigneeName = ap?.full_name ?? assignee?.full_name ?? null;
                    return (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <div className="font-medium">{proposal.team_name}</div>
                        <div className="text-xs text-muted-foreground">{proposal.product_name}</div>
                      </TableCell>
                      <TableCell>
                        {assigneeName ? (
                          <span className="text-sm">{assigneeName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={proposal.is_graded ? "default" : "secondary"}>
                          {proposal.is_graded ? "Graded" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {proposal.is_graded ? `${proposal.total_score}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {proposal.is_graded ? (
                          renderBreakdownDialog(proposal, "Breakdown", buttonVariants({ variant: "outline", size: "sm" }))
                        ) : (
                          <span className="text-sm text-muted-foreground">Pending</span>
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

        {/* Top 15 Teams (Right) */}
        <Card>
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
                  <div key={team.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{team.team_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold">{team.total_score}</div>
                      {renderBreakdownDialog(
                        team,
                        <BarChart className="h-4 w-4" />,
                        buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 text-muted-foreground" })
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
  );
}
