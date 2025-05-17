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
import { PlusCircleIcon, SaveIcon, DownloadIcon, Trash2Icon, RotateCcwIcon, ChefHatIcon } from "lucide-react";

import IngredientSlider from './ingredient-slider';
import AmendmentItem from './amendment-item';

const initialRecipeState: Recipe = {
  name: 'New Recipe',
  flourWeight: 500,
  waterPercentage: 65,
  saltPercentage: 2,
  yeastPercentage: 1,
  amendments: [],
};

export default function DoughMasterApp() {
  const { toast } = useToast();
  const [flourWeight, setFlourWeight] = useState<number>(initialRecipeState.flourWeight);
  const [waterPercentage, setWaterPercentage] = useState<number>(initialRecipeState.waterPercentage);
  const [saltPercentage, setSaltPercentage] = useState<number>(initialRecipeState.saltPercentage);
  const [yeastPercentage, setYeastPercentage] = useState<number>(initialRecipeState.yeastPercentage);
  const [amendments, setAmendments] = useState<Amendment[]>(initialRecipeState.amendments);
  const [recipeName, setRecipeName] = useState<string>(initialRecipeState.name);

  const [savedRecipes, setSavedRecipes] = useLocalStorage<Recipe[]>('doughMasterRecipes', []);
  const [selectedRecipeToLoad, setSelectedRecipeToLoad] = useState<string>('');

  const calculateWeight = useCallback((percentage: number) => {
    if (flourWeight <= 0) return 0;
    return (flourWeight * percentage) / 100;
  }, [flourWeight]);

  const waterWeight = useMemo(() => calculateWeight(waterPercentage), [calculateWeight, waterPercentage]);
  const saltWeight = useMemo(() => calculateWeight(saltPercentage), [calculateWeight, saltPercentage]);
  const yeastWeight = useMemo(() => calculateWeight(yeastPercentage), [calculateWeight, yeastPercentage]);

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

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      toast({ title: "Error", description: "Please enter a recipe name.", variant: "destructive" });
      return;
    }
    const newRecipe: Recipe = {
      name: recipeName.trim(),
      flourWeight,
      waterPercentage,
      saltPercentage,
      yeastPercentage,
      amendments,
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
    // If newly saved recipe name is not in select, set it
    if (!savedRecipes.find(r => r.name === newRecipe.name)) {
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
        resetToInitialState(false); // Reset form if current recipe was deleted, without toast
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
    setSelectedRecipeToLoad('');
    if (showToast) {
      toast({ title: "Form Reset", description: "Recipe form has been reset to default values." });
    }
  };

  const totalDoughWeight = useMemo(() => {
    return flourWeight + waterWeight + saltWeight + yeastWeight + amendments.reduce((sum, am) => sum + am.weight, 0);
  }, [flourWeight, waterWeight, saltWeight, yeastWeight, amendments]);

  const totalHydration = useMemo(() => {
    if (flourWeight <= 0) return 0;
    return (waterWeight / flourWeight) * 100;
  }, [flourWeight, waterWeight]);


  return (
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
            <IngredientSlider label="Water" value={waterPercentage} onChange={setWaterPercentage} min={0} max={150} step={0.1} calculatedWeight={waterWeight} />
            <IngredientSlider label="Salt" value={saltPercentage} onChange={setSaltPercentage} min={0} max={5} step={0.05} calculatedWeight={saltWeight} />
            <IngredientSlider label="Yeast" value={yeastPercentage} onChange={setYeastPercentage} min={0} max={3} step={0.01} calculatedWeight={yeastWeight} />
          </div>
        </CardSection>
        
        <CardSection title="Recipe Overview">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Total Dough Weight:</span> <span className="font-semibold text-foreground">{totalDoughWeight.toFixed(1)}g</span></div>
            <div className="flex justify-between"><span>Overall Hydration:</span> <span className="font-semibold text-foreground">{totalHydration.toFixed(1)}%</span></div>
          </div>
        </CardSection>

        <CardSection title="Amendments" description="Add extra ingredients like sugar, eggs, or butter.">
          <div className="space-y-3">
            {amendments.map((am, index) => (
              <AmendmentItem key={am.id} amendment={am} onNameChange={handleUpdateAmendmentName} onWeightChange={handleUpdateAmendmentWeight} onRemove={handleRemoveAmendment} index={index} />
            ))}
            <Button onClick={handleAddAmendment} variant="outline" className="w-full border-dashed hover:border-solid hover:bg-accent/20 transition-colors">
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Amendment
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
