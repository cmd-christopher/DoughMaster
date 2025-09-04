"use client";

import RecipeTiles from "@/components/recipe-tiles";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-10 selection:bg-primary/30">
      <div className="mx-auto max-w-5xl">
        <RecipeTiles />
      </div>
    </main>
  );
}
