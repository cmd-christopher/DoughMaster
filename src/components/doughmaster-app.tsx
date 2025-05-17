
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe, Amendment } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircleIcon, SaveIcon, DownloadIcon, Trash2Icon, RotateCcwIcon, ChefHatIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


import IngredientSlider from './ingredient-slider';
import AmendmentItem from './amendment-item';

// Constants for egg calculations
const EGG_WEIGHT_G = 50; // Average large egg weight in grams
const EGG_WATER_CONTENT_PERCENTAGE = 75; // Approximate water content of an egg
const FLOUR_PER_EGG_G = 300; // Default: 1 egg per 300g of flour

const initialRecipeState: Recipe = {
  name: 'New Recipe',
  flourWeight: 500,
  waterPercentage: 65, // This is for ADDED water
  saltPercentage: 2,
  yeastPercentage: 1,
  amendments: [], // Custom amendments
  // Predefined additions defaults
  useSugar: false,
  sugarPercentage: 5, // Default 5% if used
  useEgg: false,
  eggCount: 1,        // Default 1 egg if used
  useButter: false,
  butterPercentage: 10, // Default 10% if used
  useOil: false,
  oilPercentage: 3,   // Default 3% if used
};

export default function DoughMasterApp() {
  const { toast } = useToast();
  const [recipeName, setRecipeName] = useState<string>(initialRecipeState.name);
  const [flourWeight, setFlourWeight] = useState<number>(initialRecipeState.flourWeight);
  const [waterPercentage, setWaterPercentage] = useState<number>(initialRecipeState.waterPercentage); // Added water %
  const [saltPercentage, setSaltPercentage] = useState<number>(initialRecipeState.saltPercentage);
  const [yeastPercentage, setYeastPercentage] = useState<number>(initialRecipeState.yeastPercentage);
  const [amendments, setAmendments] = useState<Amendment[]>(initialRecipeState.amendments);

  // State for predefined amendments
  const [useSugar, setUseSugar] = useState<boolean>(initialRecipeState.useSugar!);
  const [sugarPercentageState, setSugarPercentageState] = useState<number>(initialRecipeState.sugarPercentage!);
  const [useEgg, setUseEgg] = useState<boolean>(initialRecipeState.useEgg!);
  const [eggCountState, setEggCountState] = useState<number>(initialRecipeState.eggCount!);
  const [useButter, setUseButter] = useState<boolean>(initialRecipeState.useButter!);
  const [butterPercentageState, setButterPercentageState] = useState<number>(initialRecipeState.butterPercentage!);
  const [useOil, setUseOil] = useState<boolean>(initialRecipeState.useOil!);
  const [oilPercentageState, setOilPercentageState] = useState<number>(initialRecipeState.oilPercentage!);

  const [savedRecipes, setSavedRecipes] = useLocalStorage<Recipe[]>('doughMasterRecipes', []);
  const [selectedRecipeToLoad, setSelectedRecipeToLoad] = useState<string>('');

  const calculateWeight = useCallback((percentage: number) => {
    if (flourWeight <= 0) return 0;
    return (flourWeight * percentage) / 100;
  }, [flourWeight]);

  // Core ingredient weights
  const waterWeight = useMemo(() => calculateWeight(waterPercentage), [calculateWeight, waterPercentage]); // Added water weight
  const saltWeight = useMemo(() => calculateWeight(saltPercentage), [calculateWeight, saltPercentage]);
  const yeastWeight = useMemo(() => calculateWeight(yeastPercentage), [calculateWeight, yeastPercentage]);

  // Predefined amendment weights
  const sugarWeight = useMemo(() => useSugar ? (flourWeight * sugarPercentageState) / 100 : 0, [useSugar, flourWeight, sugarPercentageState]);
  const butterWeight = useMemo(() => useButter ? (flourWeight * butterPercentageState) / 100 : 0, [useButter, flourWeight, butterPercentageState]);
  const oilWeight = useMemo(() => useOil ? (flourWeight * oilPercentageState) / 100 : 0, [useOil, flourWeight, oilPercentageState]);
  const totalEggWeight = useMemo(() => useEgg ? eggCountState * EGG_WEIGHT_G : 0, [useEgg, eggCountState]);
  const waterFromEggs = useMemo(() => useEgg ? (totalEggWeight * EGG_WATER_CONTENT_PERCENTAGE) / 100 : 0, [useEgg, totalEggWeight]);

  const handleToggleUseEgg = (checked: boolean) => {
    setUseEgg(checked);
    if (checked) {
      if (eggCountState === 0 && flourWeight > 0) {
        const defaultEggs = Math.max(1, Math.round(flourWeight / FLOUR_PER_EGG_G));
        setEggCountState(defaultEggs);
      } else if (eggCountState === 0 && flourWeight === 0) {
        setEggCountState(1); // Default to 1 if no flour yet, user can adjust
      }
    }
  };
  
  // Update default egg count if flour weight changes and eggs are active but count is at a typical "initial default"
  useEffect(() => {
    if (useEgg && flourWeight > 0) {
        const calculatedDefaultEggs = Math.max(1, Math.round(flourWeight / FLOUR_PER_EGG_G));
        // This logic ensures that if the user actively set it to something, it's not overridden
        // unless it's at the very initial default of 1 and flour implies more.
        if (eggCountState <= 1 || eggCountState !== calculatedDefaultEggs) { 
             // Heuristic: if current eggCount is 1 (common initial) or less, or not matching current flour based calculation, offer to update.
             // For simplicity now, let's just update it if it's significantly different or 0/1.
             // A more advanced logic could be to only set it if it was the *initial default*.
             // Let's refine: only set if it's the placeholder '1' and flour suggests more, or if it's zero.
             if (eggCountState === 0 || (eggCountState === 1 && calculatedDefaultEggs > 1) ) {
                setEggCountState(calculatedDefaultEggs);
             }
        }
    } else if (useEgg && flourWeight === 0 && eggCountState === 0) {
        setEggCountState(1); // if eggs active but no flour, default to 1
    }
  }, [flourWeight, useEgg]);


  // Custom amendments logic
  const handleAddAmendment = () => {
    setAmendments([...amendments, { id: crypto.randomUUID(), name: '', weight: 0 }]);
  };

  const handleUpdateAmendmentName = (id: string, name: string) => {
    setAmendments(prevAmendments => prevAmendments.map(am => am.id === id ? { ...am, name } : am));
  };

  const handleUpdateAmendmentWeight = (id: string, weight: number) => {
    setAmendments(prevAmendments => prevAmendments.map(am => am.id === id ? { ...am, weight } : am));
  };

  const handleRemoveAmendment = (id: string) => {
    setAmendments(prevAmendments => prevAmendments.filter(am => am.id !== id));
  };

  // Recipe management
  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      toast({ title: "Error", description: "Please enter a recipe name.", variant: "destructive" });
      return;
    }
    const newRecipe: Recipe = {
      name: recipeName.trim(),
      flourWeight,
      waterPercentage, // Added water percentage
      saltPercentage,
      yeastPercentage,
      amendments,
      useSugar,
      sugarPercentage: sugarPercentageState,
      useEgg,
      eggCount: eggCountState,
      useButter,
      butterPercentage: butterPercentageState,
      useOil,
      oilPercentage: oilPercentageState,
    };
    const existingRecipeIndex = savedRecipes.findIndex(r => r.name === newRecipe.name);
    if (existingRecipeIndex > -1) {
      const updatedRecipes = [...savedRecipes];
      updatedRecipes[existingRecipeIndex] = newRecipe;
      setSavedRecipes(updatedRecipes);
      toast({ title: "Recipe Updated", description: `"${newRecipe.name}" has been updated.` });
    } else {
      setSavedRecipes([...savedRecipes, newRecipe]);
      toast({ title: "Recipe Saved", description: `"${newRecipe.name}" has been saved.` });
    }
    if (!savedRecipes.find(r => r.name === newRecipe.name) || selectedRecipeToLoad !== newRecipe.name) {
       setSelectedRecipeToLoad(newRecipe.name);
    }
  };

  const handleLoadRecipe = () => {
    if (!selectedRecipeToLoad) {
        toast({ title: "Error", description: "Please select a recipe to load.", variant: "destructive" });
        return;
    }
    const recipeToLoad = savedRecipes.find(r => r.name === selectedRecipeToLoad);
    if (recipeToLoad) {
      setRecipeName(recipeToLoad.name);
      setFlourWeight(recipeToLoad.flourWeight);
      setWaterPercentage(recipeToLoad.waterPercentage);
      setSaltPercentage(recipeToLoad.saltPercentage);
      setYeastPercentage(recipeToLoad.yeastPercentage);
      setAmendments(recipeToLoad.amendments);
      
      setUseSugar(recipeToLoad.useSugar ?? initialRecipeState.useSugar!);
      setSugarPercentageState(recipeToLoad.sugarPercentage ?? initialRecipeState.sugarPercentage!);
      setUseEgg(recipeToLoad.useEgg ?? initialRecipeState.useEgg!);
      setEggCountState(recipeToLoad.eggCount ?? initialRecipeState.eggCount!);
      setUseButter(recipeToLoad.useButter ?? initialRecipeState.useButter!);
      setButterPercentageState(recipeToLoad.butterPercentage ?? initialRecipeState.butterPercentage!);
      setUseOil(recipeToLoad.useOil ?? initialRecipeState.useOil!);
      setOilPercentageState(recipeToLoad.oilPercentage ?? initialRecipeState.oilPercentage!);
      
      toast({ title: "Recipe Loaded", description: `"${recipeToLoad.name}" has been loaded.` });
    }
  };
  
  const handleDeleteRecipe = () => {
    if (!selectedRecipeToLoad) {
        toast({ title: "Error", description: "Please select a recipe to delete.", variant: "destructive" });
        return;
    }
    setSavedRecipes(prevRecipes => prevRecipes.filter(r => r.name !== selectedRecipeToLoad));
    toast({ title: "Recipe Deleted", description: `"${selectedRecipeToLoad}" has been deleted.` });
    if (recipeName === selectedRecipeToLoad) { 
        resetToInitialState(false);
    }
    setSelectedRecipeToLoad(''); 
  };
  
  const resetToInitialState = (showToast = true) => {
    setRecipeName(initialRecipeState.name);
    setFlourWeight(initialRecipeState.flourWeight);
    setWaterPercentage(initialRecipeState.waterPercentage);
    setSaltPercentage(initialRecipeState.saltPercentage);
    setYeastPercentage(initialRecipeState.yeastPercentage);
    setAmendments(initialRecipeState.amendments);

    setUseSugar(initialRecipeState.useSugar!);
    setSugarPercentageState(initialRecipeState.sugarPercentage!);
    setUseEgg(initialRecipeState.useEgg!);
    setEggCountState(initialRecipeState.eggCount!);
    setUseButter(initialRecipeState.useButter!);
    setButterPercentageState(initialRecipeState.butterPercentage!);
    setUseOil(initialRecipeState.useOil!);
    setOilPercentageState(initialRecipeState.oilPercentage!);
    
    setSelectedRecipeToLoad('');
    if (showToast) {
      toast({ title: "Form Reset", description: "Recipe form has been reset to default values." });
    }
  };

  const totalDoughWeight = useMemo(() => {
    return flourWeight + waterWeight + saltWeight + yeastWeight +
           sugarWeight + totalEggWeight + butterWeight + oilWeight +
           amendments.reduce((sum, am) => sum + am.weight, 0);
  }, [flourWeight, waterWeight, saltWeight, yeastWeight, sugarWeight, totalEggWeight, butterWeight, oilWeight, amendments]);

  const totalHydration = useMemo(() => {
    if (flourWeight <= 0) return 0;
    const totalWaterInRecipe = waterWeight + waterFromEggs;
    return (totalWaterInRecipe / flourWeight) * 100;
  }, [flourWeight, waterWeight, waterFromEggs]);


  return (
    <TooltipProvider>
    <Card className="w-full max-w-3xl shadow-2xl bg-card/95 backdrop-blur-sm border-border/50">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center space-x-3 mb-2">
          <ChefHatIcon className="w-10 h-10 text-primary" strokeWidth={1.5} />
          <CardTitle className="text-4xl font-bold tracking-tight">DoughMaster</CardTitle>
        </div>
        <CardDescription className="text-md text-muted-foreground">Craft your perfect bread recipe.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 md:p-6">
        
        <CardSection title="Base Flour">
          <Label htmlFor="flourWeight" className="text-sm font-medium">Total Flour Weight (grams)</Label>
          <Input
            id="flourWeight"
            type="number"
            value={flourWeight <= 0 ? "" : flourWeight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setFlourWeight(isNaN(val) || val < 0 ? 0 : val);
            }}
            placeholder="e.g., 500"
            className="mt-1 text-base"
            min="0"
          />
        </CardSection>

        <CardSection title="Core Ingredients (Baker's %)">
          <div className="grid md:grid-cols-3 gap-4">
            <IngredientSlider 
              label="Added Water" 
              value={waterPercentage} 
              onChange={setWaterPercentage} 
              min={0} max={150} step={0.1} 
              calculatedWeight={waterWeight} 
              tooltipContent="This is water you add, excluding water from eggs."
            />
            <IngredientSlider label="Salt" value={saltPercentage} onChange={setSaltPercentage} min={0} max={5} step={0.05} calculatedWeight={saltWeight} />
            <IngredientSlider label="Yeast" value={yeastPercentage} onChange={setYeastPercentage} min={0} max={3} step={0.01} calculatedWeight={yeastWeight} />
          </div>
        </CardSection>
        
        <CardSection title="Common Additions" description="Optionally include and adjust common ingredients. Percentages are based on flour weight.">
          <div className="space-y-4">
            {/* Sugar */}
            <div className="p-3 border rounded-md bg-background/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="useSugar" checked={useSugar} onCheckedChange={(checked) => setUseSugar(Boolean(checked))} />
                  <Label htmlFor="useSugar" className="text-base font-medium">Sugar</Label>
                </div>
                {useSugar && (
                  <span className="text-sm font-semibold text-foreground">{sugarWeight.toFixed(1)}g</span>
                )}
              </div>
              {useSugar && (
                <div className="mt-2 pl-8"> {/* Indent content */}
                  <Label htmlFor="sugarPercentage" className="text-xs text-muted-foreground">Baker's Percentage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="sugarPercentage"
                      type="number"
                      value={sugarPercentageState}
                      onChange={(e) => setSugarPercentageState(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-24 h-9 text-sm"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Eggs */}
            <div className="p-3 border rounded-md bg-background/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="useEgg" checked={useEgg} onCheckedChange={(checked) => handleToggleUseEgg(Boolean(checked))} />
                  <Label htmlFor="useEgg" className="text-base font-medium">Eggs</Label>
                </div>
                {useEgg && (
                  <span className="text-sm font-semibold text-foreground">{totalEggWeight.toFixed(0)}g total</span>
                )}
              </div>
              {useEgg && (
                <div className="mt-2 pl-8 space-y-1"> {/* Indent content */}
                  <Label htmlFor="eggCount" className="text-xs text-muted-foreground">Number of whole eggs (approx. {EGG_WEIGHT_G}g each)</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="eggCount"
                      type="number"
                      value={eggCountState}
                      onChange={(e) => setEggCountState(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-24 h-9 text-sm"
                      min="0"
                      step="1"
                    />
                    <span className="text-sm text-muted-foreground">count</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Adds approx. <span className="font-medium text-foreground">{waterFromEggs.toFixed(1)}g</span> of water. Consider adjusting "Added Water %" for desired total hydration.
                  </p>
                </div>
              )}
            </div>
            
            {/* Butter */}
            <div className="p-3 border rounded-md bg-background/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="useButter" checked={useButter} onCheckedChange={(checked) => setUseButter(Boolean(checked))} />
                  <Label htmlFor="useButter" className="text-base font-medium">Butter</Label>
                </div>
                {useButter && (
                  <span className="text-sm font-semibold text-foreground">{butterWeight.toFixed(1)}g</span>
                )}
              </div>
              {useButter && (
                <div className="mt-2 pl-8">
                  <Label htmlFor="butterPercentage" className="text-xs text-muted-foreground">Baker's Percentage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="butterPercentage"
                      type="number"
                      value={butterPercentageState}
                      onChange={(e) => setButterPercentageState(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-24 h-9 text-sm"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Oil */}
            <div className="p-3 border rounded-md bg-background/70 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="useOil" checked={useOil} onCheckedChange={(checked) => setUseOil(Boolean(checked))} />
                  <Label htmlFor="useOil" className="text-base font-medium">Oil</Label>
                </div>
                {useOil && (
                  <span className="text-sm font-semibold text-foreground">{oilWeight.toFixed(1)}g</span>
                )}
              </div>
              {useOil && (
                <div className="mt-2 pl-8">
                  <Label htmlFor="oilPercentage" className="text-xs text-muted-foreground">Baker's Percentage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="oilPercentage"
                      type="number"
                      value={oilPercentageState}
                      onChange={(e) => setOilPercentageState(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-24 h-9 text-sm"
                      min="0"
                      step="0.1"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardSection>

        <CardSection title="Recipe Overview">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
                <span>Added Water Weight:</span> 
                <span className="font-semibold text-foreground">{waterWeight.toFixed(1)}g</span>
            </div>
            {useEgg && (
                 <div className="flex justify-between">
                    <span>Water from Eggs:</span> 
                    <span className="font-semibold text-foreground">{waterFromEggs.toFixed(1)}g</span>
                </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between text-base">
                <span className="font-medium">Total Dough Weight:</span> 
                <span className="font-bold text-foreground">{totalDoughWeight.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between text-base">
                <span className="font-medium">Overall Hydration:</span> 
                <span className="font-bold text-foreground">{totalHydration.toFixed(1)}%</span>
            </div>
          </div>
        </CardSection>

        <CardSection title="Other Ingredients" description="Add any other ingredients not listed above.">
          <div className="space-y-3">
            {amendments.map((am, index) => (
              <AmendmentItem key={am.id} amendment={am} onNameChange={handleUpdateAmendmentName} onWeightChange={handleUpdateAmendmentWeight} onRemove={handleRemoveAmendment} index={index} />
            ))}
            <Button onClick={handleAddAmendment} variant="outline" className="w-full border-dashed hover:border-solid hover:bg-accent/20 transition-colors">
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Other Ingredient
            </Button>
          </div>
        </CardSection>

        <Separator className="my-6" />

        <CardSection title="Recipe Management">
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipeName" className="text-sm font-medium">Recipe Name</Label>
              <Input id="recipeName" type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g., My Sourdough" className="mt-1 text-base"/>
            </div>
            <Button onClick={handleSaveRecipe} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <SaveIcon className="mr-2 h-4 w-4" /> Save Current Recipe
            </Button>

            {savedRecipes.length > 0 && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="loadRecipeSelect" className="text-sm font-medium">Load Saved Recipe</Label>
                 <div className="flex space-x-2 items-center">
                    <Select value={selectedRecipeToLoad} onValueChange={setSelectedRecipeToLoad}>
                      <SelectTrigger id="loadRecipeSelect" className="flex-grow text-sm h-10">
                        <SelectValue placeholder="Select a recipe..." />
                      </SelectTrigger>
                      <SelectContent>
                        {savedRecipes.map(r => (
                          <SelectItem key={r.name} value={r.name} className="text-sm">{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={handleLoadRecipe} variant="secondary" size="icon" disabled={!selectedRecipeToLoad} aria-label="Load selected recipe">
                        <DownloadIcon className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleDeleteRecipe} variant="destructive" size="icon" disabled={!selectedRecipeToLoad} aria-label="Delete selected recipe">
                        <Trash2Icon className="h-4 w-4" />
                    </Button>
                 </div>
              </div>
            )}
            <Button onClick={() => resetToInitialState(true)} variant="outline" className="w-full hover:bg-accent/20 transition-colors">
              <RotateCcwIcon className="mr-2 h-4 w-4" /> Reset Form
            </Button>
          </div>
        </CardSection>
      </CardContent>
      <CardFooter className="text-center py-4">
        <p className="text-xs text-muted-foreground w-full">Happy Baking!</p>
      </CardFooter>
    </Card>
    </TooltipProvider>
  );
}

// Helper component for consistent card section styling
const CardSection: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <Card className="bg-card/70 shadow-sm border-border/30">
    <CardHeader className="pb-3 pt-4">
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      {description && <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>}
    </CardHeader>
    <CardContent className="pb-4">
      {children}
    </CardContent>
  </Card>
);

