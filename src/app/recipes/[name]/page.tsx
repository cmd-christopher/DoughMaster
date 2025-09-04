"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DoughMasterApp from "@/components/doughmaster-app";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Recipe } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

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
      <div className="w-full max-w-5xl mx-auto mb-4 self-stretch">
        <Button asChild variant="ghost" size="sm" aria-label="Back to all recipes">
          <Link href="/">
            <ArrowLeftIcon className="mr-2" />
            Back to recipes
          </Link>
        </Button>
      </div>
      <DoughMasterApp initialRecipeName={initialName} hideLoadControls hideHeroHeader />
    </main>
  );
}
