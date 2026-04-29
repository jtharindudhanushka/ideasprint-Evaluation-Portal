import { Loader2 } from "lucide-react";

export default function EvaluateLoading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-2 text-[var(--uber-muted-gray)]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Loading evaluation rubric...</p>
      </div>
    </div>
  );
}
