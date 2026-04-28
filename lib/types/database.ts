// ============================================================
// TypeScript types matching the Supabase database schema
// ============================================================

export type UserRole = "admin" | "evaluator";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface RubricSection {
  id: string;
  name: string;
  total_marks: number;
  order_index: number;
  created_at: string;
  criteria?: RubricCriterion[];
}

export interface RubricCriterion {
  id: string;
  section_id: string;
  name: string;
  description: string;
  max_score: number;
  grading_bands: string[];
  order_index: number;
  created_at: string;
}

export interface Proposal {
  id: string;
  team_name: string;
  product_name: string;
  description: string;
  proposal_url: string;
  video_url: string;
  // removed lock and assigned_to columns

  total_score: number;
  is_graded: boolean;
  created_at: string;
  // Joined fields
  // assigned_profile is removed, if we want multiple we might join proposal_assignments

}

export interface Evaluation {
  id: string;
  proposal_id: string;
  evaluator_id: string;
  rubric_criterion_id: string;
  score: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ProposalAssignment {
  proposal_id: string;
  evaluator_id: string;
  created_at: string;
}

// Form types
export interface ProposalFormData {
  team_name: string;
  product_name: string;
  description: string;
  proposal_url: string;
  video_url: string;
}

export interface InviteEvaluatorFormData {
  email: string;
  full_name: string;
}

export interface EvaluationFormData {
  scores: Record<string, number>; // rubric_criterion_id -> score
  notes: Record<string, string>; // rubric_criterion_id -> notes
  global_notes: string;
}
