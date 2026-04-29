"use client";

import { useState } from "react";
import { OnboardingModal } from "@/components/onboarding-modal";

export default function OnboardingPreviewPage() {
  const [isOpen, setIsOpen] = useState(true);

  // This route is for previewing the onboarding flow in isolation.
  // It does not require authentication and does not write to the database.
  
  return (
    <main className="min-h-screen bg-bw-bg-primary flex flex-col items-center justify-center p-8">
      {/* 
        PREPRODUCTION NOTICE:
        This route must be removed or protected before production deployment.
      */}
      
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold tracking-tight">Onboarding Preview</h1>
        <p className="text-bw-content-secondary text-sm">
          Use this page to verify the layout, content, and animations of the onboarding guide. 
          The database is NOT updated from this page.
        </p>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-bw-black text-bw-white px-6 py-2 rounded-full text-sm font-bold shadow-md hover:bg-bw-black/90 transition-all"
        >
          Open Guide
        </button>
      </div>

      <OnboardingModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        isPreview={true}
      />
    </main>
  );
}
