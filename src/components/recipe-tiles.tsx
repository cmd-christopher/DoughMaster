"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useLocalStorage from "@/hooks/use-local-storage";
import type { Recipe } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, MoreVertical, Pencil, Trash2, Star, Printer } from "lucide-react";

const DEFAULT_RECIPE: Recipe = {
  name: "Basic Bread",
  flourWeight: 500,
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
  // Read-only visual default when empty; no seeding writes.
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>("doughMasterRecipes", []);
  const [pendingDeleteName, setPendingDeleteName] = useState<string | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTargetName, setRenameTargetName] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [sortBy, setSortBy] = useState<"edited" | "name" | "hydration" | "flour">("edited");

  const isFallback = recipes.length === 0;
  const allRecipes = isFallback ? [DEFAULT_RECIPE] : recipes;

  const filtered = allRecipes
    .filter(r => r.name.toLowerCase().includes(query.toLowerCase()))
    .filter(r => {
      if (tab === "favorites") return !!r.pinned;
      if (tab === "enriched") return !!(r.useEgg || r.useButter || r.useOil || r.useSugar);
      if (tab === "highHydration") return (r.desiredHydrationPercentage ?? 0) >= 70;
      return true;
    })
    .slice();

  filtered.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "hydration":
        return (b.desiredHydrationPercentage ?? 0) - (a.desiredHydrationPercentage ?? 0);
      case "flour":
        return (b.flourWeight ?? 0) - (a.flourWeight ?? 0);
      case "edited":
      default:
        return (b.updatedAt ?? 0) - (a.updatedAt ?? 0);
    }
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight pb-0.5 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">Dough Recipes</h1>
        <div className="mt-4">
          <Button asChild>
            <Link href="/recipes/new">+ New Recipe</Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl w-full space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Input
            placeholder="Search recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="sm:flex-1"
          />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="edited">Last edited</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="hydration">Hydration</SelectItem>
              <SelectItem value="flour">Flour weight</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="enriched">Enriched</TabsTrigger>
            <TabsTrigger value="highHydration">High Hydration</TabsTrigger>
          </TabsList>
          <TabsContent value="all" />
          <TabsContent value="favorites" />
          <TabsContent value="enriched" />
          <TabsContent value="highHydration" />
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => {
          const href = `/recipes/${encodeURIComponent(r.name)}`;
          if (isFallback) {
            // Simple, clickable fallback tile without actions
            return (
              <Link key={r.name} href={href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl truncate">{r.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <div>{r.flourWeight}g flour • {r.desiredHydrationPercentage}% hydration</div>
                  </CardContent>
                </Card>
              </Link>
            );
          }

          // Tile with actions: wrap the card link and overlay a menu button
          return (
            <div key={r.name} className="relative group">
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Link href={href} className="block">
                      <Card className="hover:shadow-lg transition-all cursor-pointer hover:-translate-y-0.5">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-xl truncate">{r.name}</CardTitle>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-70 hover:opacity-100"
                              aria-label={r.pinned ? "Unpin" : "Pin"}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setRecipes(recipes.map(x => x.name === r.name ? { ...x, pinned: !x.pinned, updatedAt: x.updatedAt ?? Date.now() } : x));
                              }}
                            >
                              <Star className="h-4 w-4" fill={r.pinned ? "currentColor" : "none"} />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          <div>{r.flourWeight}g flour • {r.desiredHydrationPercentage}% hydration</div>
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {!!r.useEgg && <Badge variant="secondary">Egg</Badge>}
                            {!!r.useSugar && <Badge variant="secondary">Sweet</Badge>}
                            {!!r.useButter && <Badge variant="secondary">Butter</Badge>}
                            {!!r.useOil && <Badge variant="secondary">Oil</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-0.5">
                      <div><span className="font-medium">Hydration:</span> {r.desiredHydrationPercentage}%</div>
                      <div><span className="font-medium">Flour:</span> {r.flourWeight}g</div>
                      <div className="text-muted-foreground">Salt {r.saltPercentage}% • Yeast {r.yeastPercentage}%</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="absolute top-2 right-2 opacity-90 group-hover:opacity-100">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Recipe actions for ${r.name}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => { e.stopPropagation(); }}>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        // Navigate to detail and auto-print
                        window.location.href = `${href}?print=1`;
                      }}
                    >
                      <Printer className="mr-2 h-4 w-4" /> Print
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        setRenameTargetName(r.name);
                        setRenameValue(r.name);
                        setRenameOpen(true);
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(e) => {
                        e.preventDefault();
                        const base = r.name.trim() || "New Recipe";
                        let candidate = base;
                        let i = 1;
                        while (recipes.some((x) => x.name === candidate)) {
                          i += 1;
                          candidate = `${base} (${i})`;
                        }
                        const copy: Recipe = { ...r, name: candidate };
                        copy.updatedAt = Date.now();
                        setRecipes([...recipes, copy]);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Duplicate
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            setPendingDeleteName(r.name);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Recipe
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete recipe?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove "{pendingDeleteName ?? r.name}" from your saved recipes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setPendingDeleteName(null)}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                              e.preventDefault();
                              const nameToDelete = pendingDeleteName ?? r.name;
                              setRecipes(recipes.filter((x) => x.name !== nameToDelete));
                              setPendingDeleteName(null);
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}

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

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Rename recipe</DialogTitle>
            <DialogDescription>Choose a unique name for this recipe.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="renameInput">New name</Label>
            <Input
              id="renameInput"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="e.g., Sandwich Rolls"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const trimmed = renameValue.trim();
                  if (!trimmed || !renameTargetName) return;
                  const exists = recipes.some((x) => x.name === trimmed && x.name !== renameTargetName);
                  if (exists) return;
                  setRecipes(recipes.map((x) => (x.name === renameTargetName ? { ...x, name: trimmed, updatedAt: Date.now() } : x)));
                  setRenameOpen(false);
                }
              }}
            />
            {(() => {
              const trimmed = renameValue.trim();
              const invalid = !trimmed || (renameTargetName ? recipes.some((x) => x.name === trimmed && x.name !== renameTargetName) : false);
              return invalid ? (
                <p className="text-xs text-destructive">Enter a unique, non-empty name.</p>
              ) : null;
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                const trimmed = renameValue.trim();
                if (!trimmed || !renameTargetName) return;
                const exists = recipes.some((x) => x.name === trimmed && x.name !== renameTargetName);
                if (exists) return;
                setRecipes(recipes.map((x) => (x.name === renameTargetName ? { ...x, name: trimmed, updatedAt: Date.now() } : x)));
                setRenameOpen(false);
              }}
              disabled={!renameValue.trim() || (renameTargetName ? recipes.some((x) => x.name === renameValue.trim() && x.name !== renameTargetName) : true)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
