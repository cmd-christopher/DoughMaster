"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import DoughMasterApp from "@/components/doughmaster-app";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Recipe } from "@/lib/types";

export default function RecipeDetailPage() {
  const params = useParams<{ name: string }>();
  const router = useRouter();
  const [recipes] = useLocalStorage<Recipe[]>("doughMasterRecipes", []);

  const decodedName = decodeURIComponent(params.name);

  const initialName = useMemo(() => {
    if (decodedName === "new") return undefined;
    return decodedName;
  }, [decodedName]);

  // If the route is for a specific recipe name that doesn't exist, fall back to home
  if (decodedName !== "new" && recipes.length > 0 && !recipes.find(r => r.name === decodedName)) {
    // Best-effort redirect client-side
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center selection:bg-primary/30">
      <DoughMasterApp initialRecipeName={initialName} hideLoadControls hideHeroHeader />
    </main>
  );
}
