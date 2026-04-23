"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Edit,
  Save
} from "lucide-react";
import { isLockedByOther, timeAgo } from "@/lib/utils";
import type { Proposal, RubricSection, Evaluation } from "@/lib/types/database";

interface Props {
  proposal: Proposal;
  sections: RubricSection[];
  existingEvaluations: Evaluation[];
  currentUserId: string;
  serverNow?: string;
}

const getBandColor = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes("excellent") || lower.includes("outstanding") || lower.includes("high")) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
  if (lower.includes("good") || lower.includes("proficient") || lower.includes("above average")) return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  if (lower.includes("average") || lower.includes("fair") || lower.includes("adequate")) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
  if (lower.includes("poor") || lower.includes("weak") || lower.includes("below")) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  return "bg-muted text-muted-foreground";
};

export function EvaluationViewClient({
  proposal,
  sections,
  existingEvaluations,
  currentUserId,
  serverNow = new Date().toISOString(),
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [globalNotes, setGlobalNotes] = useState("");
  
  const isAlreadyGraded = existingEvaluations.length > 0;
  const [isEditing, setIsEditing] = useState(!isAlreadyGraded);

  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Initialize form with existing evaluations
  useEffect(() => {
    if (existingEvaluations.length > 0) {
      const initialScores: Record<string, number> = {};
      const initialNotes: Record<string, string> = {};

      existingEvaluations.forEach((ev) => {
        initialScores[ev.rubric_criterion_id] = ev.score;
        initialNotes[ev.rubric_criterion_id] = ev.notes;
      });

      setScores(initialScores);
      setNotes(initialNotes);
    }
  }, [existingEvaluations]);

  // Acquire lock on mount if editing
  useEffect(() => {
    if (!isEditing) return;

    const acquireLock = async () => {
      const serverTime = new Date(serverNow).getTime();
      const twoHoursAgo = new Date(serverTime - 2 * 60 * 60 * 1000).toISOString();
      
      // Update only if lock is available (null, ours, or expired)
      const { data, error } = await supabase
        .from("proposals")
        .update({
          locked_by: currentUserId,
          locked_at: serverNow,
        })
        .eq("id", proposal.id)
        .or(`locked_by.is.null,locked_by.eq.${currentUserId},locked_at.lt.${twoHoursAgo}`)
        .select();

      // If no rows were returned, it means the condition failed (someone else locked it)
      if (error) {
        toast.error("Failed to acquire lock.");
        router.push("/evaluator");
        return;
      }
      
      if (!data || data.length === 0) {
        toast.error("This proposal is currently being evaluated by someone else.");
        router.push("/evaluator");
      }
    };

    acquireLock();

    // Release lock on unmount
    return () => {
      supabase
        .from("proposals")
        .update({ locked_by: null, locked_at: null })
        .eq("id", proposal.id)
        .eq("locked_by", currentUserId)
        .then(() => {});
    };
  }, [proposal.id, currentUserId, supabase, isEditing]);

  const handleScoreChange = useCallback(
    (criterionId: string, value: string, maxScore: number) => {
      const numValue = parseInt(value) || 0;
      const clampedValue = Math.min(Math.max(0, numValue), maxScore);
      setScores((prev) => ({ ...prev, [criterionId]: clampedValue }));
    },
    []
  );

  const handleNotesChange = useCallback(
    (criterionId: string, value: string) => {
      setNotes((prev) => ({ ...prev, [criterionId]: value }));
    },
    []
  );

  // Calculate total score
  const totalScore = Object.values(scores).reduce(
    (sum, score) => sum + score,
    0
  );
  const maxPossibleScore = sections.reduce((sum, s) => sum + s.total_marks, 0);

  const handleSubmit = async () => {
    // Validate all criteria have scores
    const allCriteria = sections.flatMap((s) => s.criteria ?? []);
    const missingScores = allCriteria.filter(
      (c) => scores[c.id] === undefined || scores[c.id] === null
    );

    if (missingScores.length > 0) {
      toast.error(
        `Please score all criteria. Missing: ${missingScores.map((c) => c.name).join(", ")}`
      );
      return;
    }

    setLoading(true);

    try {
      // Upsert evaluations for each criterion
      const evaluationRows = allCriteria.map((criterion) => ({
        proposal_id: proposal.id,
        evaluator_id: currentUserId,
        rubric_criterion_id: criterion.id,
        score: scores[criterion.id] ?? 0,
        notes: notes[criterion.id] || globalNotes || "",
        updated_at: new Date().toISOString(),
      }));

      const { error: evalError } = await supabase
        .from("evaluations")
        .upsert(evaluationRows, {
          onConflict: "proposal_id,evaluator_id,rubric_criterion_id",
        });

      if (evalError) throw evalError;

      // Update proposal: set graded status, total score, clear lock
      const { error: proposalError } = await supabase
        .from("proposals")
        .update({
          is_graded: true,
          total_score: totalScore,
          locked_by: null,
          locked_at: null,
        })
        .eq("id", proposal.id);

      if (proposalError) throw proposalError;

      toast.success("Evaluation saved successfully!");
      setIsEditing(false); // Switch back to view mode
      router.push("/evaluator");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save evaluation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/evaluator")}
            className="text-muted-foreground -ml-2 mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{proposal.product_name}</h2>
            {!isEditing && <Badge variant="secondary">Read Only</Badge>}
          </div>
          <p className="text-muted-foreground">by {proposal.team_name}</p>
          {proposal.description && (
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl">
              {proposal.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {proposal.proposal_url && (
            <a
              href={proposal.proposal_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Proposal
            </a>
          )}
          {proposal.video_url && (
            <a
              href={proposal.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline" })}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Watch Video
            </a>
          )}
        </div>
      </div>

      {/* Score Progress (Sticky) */}
      <div className="sticky top-2 z-40 bg-background/95 backdrop-blur pt-2 pb-4 border-b -mx-4 px-4 sm:mx-0 sm:px-0">
        <Card className="shadow-md border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Total Marks</span>
              <span className="text-lg font-bold">
                {totalScore} / {maxPossibleScore}
              </span>
            </div>
            <Progress
              value={maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0}
              className="h-2.5"
            />
          </CardContent>
        </Card>
      </div>

      {/* Rubric Sections */}
      {sections.map((section) => (
        <Card key={section.id} className={!isEditing ? "opacity-90 bg-muted/20" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
            <div>
              <CardTitle className="text-xl">{section.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {section.total_marks} marks total
              </p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {(section.criteria ?? []).reduce(
                (sum, c) => sum + (scores[c.id] ?? 0),
                0
              )}{" "}
              / {section.total_marks}
            </Badge>
          </CardHeader>
          <CardContent className="divide-y">
            {(section.criteria ?? []).map((criterion) => (
              <div key={criterion.id} className="py-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold">{criterion.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {criterion.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        id={`score-${criterion.id}`}
                        type="number"
                        min={0}
                        max={criterion.max_score}
                        value={
                          scores[criterion.id] !== undefined
                            ? String(scores[criterion.id])
                            : ""
                        }
                        onChange={(e) =>
                          handleScoreChange(
                            criterion.id,
                            e.target.value,
                            criterion.max_score
                          )
                        }
                        className="w-20 text-center font-bold"
                        disabled={!isEditing}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        / {criterion.max_score}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grading Bands */}
                <div className="flex flex-wrap gap-2">
                  {criterion.grading_bands.map((band, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={`font-normal ${getBandColor(band)}`}
                    >
                      {band}
                    </Badge>
                  ))}
                </div>

                {/* Per-criterion notes */}
                <Textarea
                  id={`notes-${criterion.id}`}
                  placeholder={`Comments for ${criterion.name}...`}
                  value={notes[criterion.id] ?? ""}
                  onChange={(e) => handleNotesChange(criterion.id, e.target.value)}
                  className="mt-2 min-h-[80px]"
                  disabled={!isEditing}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Global Notes */}
      <Card className={!isEditing ? "opacity-90 bg-muted/20" : ""}>
        <CardHeader>
          <CardTitle>Overall Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="global-notes"
            placeholder="Final feedback for the team..."
            value={globalNotes}
            onChange={(e) => setGlobalNotes(e.target.value)}
            className="min-h-[120px]"
            disabled={!isEditing}
          />
        </CardContent>
      </Card>

      {/* Action Buttons (Fixed Bottom Banner) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 border-t backdrop-blur z-50 flex justify-end gap-3 px-8">
        <div className="max-w-5xl mx-auto w-full flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/evaluator")}
          >
            Cancel
          </Button>

          {!isEditing ? (
            <>
              <Button
                variant="default"
                className="min-w-[200px]"
                onClick={() => setShowEditConfirm(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Grading
              </Button>
              <AlertDialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Edit this evaluation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This proposal has already been graded. Are you sure you want to enter edit mode and modify the scores? This will acquire a lock on the proposal.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      setShowEditConfirm(false);
                      setIsEditing(true);
                    }}>
                      Yes, Edit Grading
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button
                variant="default"
                className="min-w-[200px]"
                disabled={loading}
                onClick={() => setShowSubmitConfirm(true)}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : isAlreadyGraded ? (
                  <Save className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {loading ? "Saving..." : isAlreadyGraded ? "Save Changes" : "Submit Evaluation"}
              </Button>
              <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit evaluation?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to {isAlreadyGraded ? "save these changes" : "submit this evaluation"}? Please double-check the scores before proceeding.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Review Again</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      setShowSubmitConfirm(false);
                      handleSubmit();
                    }}>
                      Yes, Submit
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
