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
import { Search, UserCheck, Users, ClipboardList, Loader2, X, Plus } from "lucide-react";
import type { Proposal, Profile, ProposalAssignment } from "@/lib/types/database";

interface Props {
  proposals: Proposal[];
  evaluators: Pick<Profile, "id" | "full_name" | "role">[];
  assignments: ProposalAssignment[];
}

export function AssignmentsClient({ proposals, evaluators, assignments }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkEvaluatorId, setBulkEvaluatorId] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  // Reassign / Multi-assign dialog state
  const [assignProposal, setAssignProposal] = useState<Proposal | null>(null);
  const [assignEvaluatorId, setAssignEvaluatorId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  const filteredProposals = useMemo(() => {
    if (!searchQuery) return proposals;
    const q = searchQuery.toLowerCase();
    return proposals.filter(
      (p) =>
        p.team_name.toLowerCase().includes(q) ||
        p.product_name.toLowerCase().includes(q)
    );
  }, [proposals, searchQuery]);

  // Map proposal to its assigned evaluators
  const assigneesByProposal = useMemo(() => {
    const map: Record<string, string[]> = {};
    assignments.forEach(a => {
      if (!map[a.proposal_id]) map[a.proposal_id] = [];
      map[a.proposal_id].push(a.evaluator_id);
    });
    return map;
  }, [assignments]);

  // Stats
  const assignedCount = proposals.filter((p) => (assigneesByProposal[p.id]?.length || 0) > 0).length;
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
    
    // Upsert avoids duplicate primary key errors
    const assignmentsToInsert = Array.from(selectedIds).map(id => ({
      proposal_id: id,
      evaluator_id: bulkEvaluatorId
    }));

    const { error } = await supabase
      .from("proposal_assignments")
      .upsert(assignmentsToInsert, { onConflict: 'proposal_id,evaluator_id' });

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

  const handleUnassignAll = async (proposalIds: string[]) => {
    const { error } = await supabase
      .from("proposal_assignments")
      .delete()
      .in("proposal_id", proposalIds);
      
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`${proposalIds.length} proposal(s) completely unassigned.`);
      setSelectedIds(new Set());
      router.refresh();
    }
  };

  const handleRemoveAssignee = async (proposalId: string, evaluatorId: string) => {
    const { error } = await supabase
      .from("proposal_assignments")
      .delete()
      .eq("proposal_id", proposalId)
      .eq("evaluator_id", evaluatorId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Assignee removed.");
      router.refresh();
    }
  };

  const handleAddAssignee = async () => {
    if (!assignProposal) return;
    if (!assignEvaluatorId) {
      toast.error("Please select an evaluator.");
      return;
    }
    setAssignLoading(true);
    
    const { error } = await supabase
      .from("proposal_assignments")
      .upsert([{ proposal_id: assignProposal.id, evaluator_id: assignEvaluatorId }], { onConflict: 'proposal_id,evaluator_id' });

    if (error) {
      toast.error(error.message);
    } else {
      const evaluator = evaluators.find((e) => e.id === assignEvaluatorId);
      toast.success(`${evaluator?.full_name ?? "Evaluator"} assigned to proposal.`);
      setAssignProposal(null);
      setAssignEvaluatorId("");
      router.refresh();
    }
    setAssignLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assign Proposals</h2>
        <p className="text-muted-foreground mt-2">
          Assign proposals to evaluators. You can assign multiple evaluators to the same proposal.
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
                  const assigneeIds = assigneesByProposal[proposal.id] || [];
                  const isAssigned = assigneeIds.length > 0;
                  
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
                        <div className="flex flex-wrap gap-1">
                          {isAssigned ? (
                            assigneeIds.map(id => {
                              const e = evaluators.find(ev => ev.id === id);
                              return (
                                <Badge key={id} variant="outline" className="flex items-center gap-1 font-normal bg-muted/50">
                                  {e?.full_name || 'Unknown'}
                                  <button onClick={() => handleRemoveAssignee(proposal.id, id)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              );
                            })
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAssignProposal(proposal);
                              setAssignEvaluatorId("");
                            }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Assignee
                          </Button>
                          {isAssigned && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUnassignAll([proposal.id])}
                              title="Remove all assignments"
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

      {/* Bulk Action Bar */}
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
            Add Assignee
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleUnassignAll(Array.from(selectedIds))}
          >
            Clear Assignments
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog
        open={!!assignProposal}
        onOpenChange={(open) => {
          if (!open) {
            setAssignProposal(null);
            setAssignEvaluatorId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Add Assignee to Proposal
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium">{assignProposal?.team_name}</p>
              <p className="text-xs text-muted-foreground">
                {assignProposal?.product_name}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Select Evaluator</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={assignEvaluatorId}
                onChange={(e) => setAssignEvaluatorId(e.target.value)}
                aria-label="Select evaluator to assign"
              >
                <option value="">Select evaluator...</option>
                {evaluators.map((e) => {
                  const isAlreadyAssigned = (assigneesByProposal[assignProposal?.id || ''] || []).includes(e.id);
                  if (isAlreadyAssigned) return null;
                  return (
                    <option key={e.id} value={e.id}>
                      {e.full_name}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignProposal(null);
                setAssignEvaluatorId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAssignee}
              disabled={assignLoading || !assignEvaluatorId}
            >
              {assignLoading && (
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
