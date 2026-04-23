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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, UserCheck, Users, ClipboardList, Loader2, X } from "lucide-react";
import type { Proposal, Profile } from "@/lib/types/database";

interface Props {
  proposals: Proposal[];
  evaluators: Pick<Profile, "id" | "full_name" | "role">[];
}

export function AssignmentsClient({ proposals, evaluators }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEvaluatorId, setBulkEvaluatorId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Reassign dialog state
  const [reassignProposal, setReassignProposal] = useState<Proposal | null>(null);
  const [reassignEvaluatorId, setReassignEvaluatorId] = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  const filteredProposals = useMemo(() => {
    if (!searchQuery) return proposals;
    const q = searchQuery.toLowerCase();
    return proposals.filter(
      (p) =>
        p.team_name.toLowerCase().includes(q) ||
        p.product_name.toLowerCase().includes(q)
    );
  }, [proposals, searchQuery]);

  // Stats
  const assignedCount = proposals.filter((p) => p.assigned_to).length;
  const unassignedCount = proposals.length - assignedCount;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProposals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProposals.map((p) => p.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkAssign = async () => {
    if (!bulkEvaluatorId) {
      toast.error("Please select an evaluator to assign to.");
      return;
    }
    if (selectedIds.size === 0) {
      toast.error("No proposals selected.");
      return;
    }
    setBulkLoading(true);
    const { error } = await supabase
      .from("proposals")
      .update({ assigned_to: bulkEvaluatorId })
      .in("id", Array.from(selectedIds));

    if (error) {
      toast.error(error.message);
    } else {
      const evaluator = evaluators.find((e) => e.id === bulkEvaluatorId);
      toast.success(
        `${selectedIds.size} proposal(s) assigned to ${evaluator?.full_name ?? "evaluator"}.`
      );
      setSelectedIds(new Set());
      setBulkEvaluatorId("");
      router.refresh();
    }
    setBulkLoading(false);
  };

  const handleUnassign = async (ids: string[]) => {
    const { error } = await supabase
      .from("proposals")
      .update({ assigned_to: null })
      .in("id", ids);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${ids.length} proposal(s) unassigned.`);
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  const handleReassign = async () => {
    if (!reassignProposal) return;
    if (!reassignEvaluatorId) {
      toast.error("Please select a new evaluator.");
      return;
    }
    setReassignLoading(true);
    const { error } = await supabase
      .from("proposals")
      .update({ assigned_to: reassignEvaluatorId })
      .eq("id", reassignProposal.id);

    if (error) {
      toast.error(error.message);
    } else {
      const evaluator = evaluators.find((e) => e.id === reassignEvaluatorId);
      toast.success(`Reassigned to ${evaluator?.full_name ?? "evaluator"}.`);
      setReassignProposal(null);
      setReassignEvaluatorId("");
      router.refresh();
    }
    setReassignLoading(false);
  };

  const getAssigneeName = (proposal: Proposal) => {
    if (!proposal.assigned_to) return null;
    const e = evaluators.find((ev) => ev.id === proposal.assigned_to);
    return e?.full_name ?? null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assign Proposals</h2>
        <p className="text-muted-foreground mt-2">
          Assign proposals to evaluators. Only the assigned evaluator can grade a proposal.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unassignedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Proposals</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search team or product..."
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
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border border-input"
                    checked={
                      filteredProposals.length > 0 &&
                      selectedIds.size === filteredProposals.length
                    }
                    onChange={toggleSelectAll}
                    aria-label="Select all proposals"
                  />
                </TableHead>
                <TableHead>Team &amp; Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
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
                  const assigneeName = getAssigneeName(proposal);
                  return (
                    <TableRow
                      key={proposal.id}
                      className={selectedIds.has(proposal.id) ? "bg-muted/40" : ""}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer rounded border border-input"
                          checked={selectedIds.has(proposal.id)}
                          onChange={() => toggleSelect(proposal.id)}
                          aria-label={`Select ${proposal.team_name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{proposal.team_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {proposal.product_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={proposal.is_graded ? "default" : "secondary"}>
                          {proposal.is_graded ? "Graded" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assigneeName ? (
                          <span className="text-sm font-medium">{assigneeName}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground italic">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReassignProposal(proposal);
                              setReassignEvaluatorId(proposal.assigned_to ?? "");
                            }}
                          >
                            {assigneeName ? "Reassign" : "Assign"}
                          </Button>
                          {proposal.assigned_to && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnassign([proposal.id])}
                              title="Remove assignment"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Action Bar — appears when rows are selected */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-background shadow-2xl px-5 py-3 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={bulkEvaluatorId}
            onChange={(e) => setBulkEvaluatorId(e.target.value)}
            aria-label="Select evaluator"
          >
            <option value="">Select evaluator...</option>
            {evaluators.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            onClick={handleBulkAssign}
            disabled={bulkLoading || !bulkEvaluatorId}
          >
            {bulkLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Assign
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleUnassign(Array.from(selectedIds))}
          >
            Unassign
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Reassign Dialog */}
      <Dialog
        open={!!reassignProposal}
        onOpenChange={(open) => {
          if (!open) {
            setReassignProposal(null);
            setReassignEvaluatorId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {reassignProposal?.assigned_to ? "Reassign" : "Assign"} Proposal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium">{reassignProposal?.team_name}</p>
              <p className="text-xs text-muted-foreground">
                {reassignProposal?.product_name}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Evaluator</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={reassignEvaluatorId}
                onChange={(e) => setReassignEvaluatorId(e.target.value)}
                aria-label="Select evaluator for reassignment"
              >
                <option value="">Select evaluator...</option>
                {evaluators.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReassignProposal(null);
                setReassignEvaluatorId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReassign}
              disabled={reassignLoading || !reassignEvaluatorId}
            >
              {reassignLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
