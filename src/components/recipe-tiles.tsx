"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Recipe } from "@/lib/types";

const DEFAULT_RECIPE: Recipe = {
  name: "Basic Bread",
  flourWeight: 400,
  desiredHydrationPercentage: 65,
  saltPercentage: 2,
  yeastPercentage: 1,
  useDetailedFlourComposition: false,
  amendments: [],
  useSugar: false,
  sugarPercentage: 5,
  useEgg: false,
  eggCount: 1,
  useButter: false,
  butterPercentage: 10,
  useOil: false,
  oilPercentage: 3,
};

export default function RecipeTiles() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>("doughMasterRecipes", []);

  useEffect(() => {
    if (recipes.length === 0) {
      setRecipes([DEFAULT_RECIPE]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allRecipes = recipes.length === 0 ? [DEFAULT_RECIPE] : recipes;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Your Recipes</h1>
        <p className="text-sm text-muted-foreground mt-1">Click a tile to open and edit.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allRecipes.map((r) => (
          <Link key={r.name} href={`/recipes/${encodeURIComponent(r.name)}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl truncate">{r.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <div>{r.flourWeight}g flour • {r.desiredHydrationPercentage}% hydration</div>
              </CardContent>
            </Card>
          </Link>
        ))}

        <Link href="/recipes/new">
          <Card className="border-dashed hover:border-solid hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">+ New Recipe</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Start from defaults and tweak.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

