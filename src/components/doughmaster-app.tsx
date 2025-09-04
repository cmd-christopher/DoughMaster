
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Recipe, Amendment, FlourSpec, LiquidSpec } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircleIcon, SaveIcon, DownloadIcon, Trash2Icon, RotateCcwIcon, ChefHatIcon, InfoIcon, ListChecksIcon, Settings2Icon, WheatIcon, MilkIcon, BeakerIcon, DropletsIcon, PrinterIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import IngredientSlider from './ingredient-slider';
import AmendmentItem from './amendment-item';
import FlourSpecItem from './flour-spec-item';
import LiquidSpecItem from './liquid-spec-item';

// Constants
const EGG_WEIGHT_G = 50; 
const EGG_WATER_CONTENT_PERCENTAGE = 75;
const FLOUR_PER_EGG_G = 300;

const PREDEFINED_FLOURS: Omit<FlourSpec, 'shareValue'>[] = [
  { id: 'breadFlour', name: 'Bread Flour', isCustom: false, isPredefined: true },
  { id: 'wholeWheatFlour', name: 'Whole Wheat Flour', isCustom: false, isPredefined: true },
  { id: 'ryeFlour', name: 'Rye Flour', isCustom: false, isPredefined: true },
  { id: 'semolinaFlour', name: 'Semolina Flour', isCustom: false, isPredefined: true },
];

const initialFlourComposition = (): FlourSpec[] => [
  { ...PREDEFINED_FLOURS[0], shareValue: 100 },
  { ...PREDEFINED_FLOURS[1], shareValue: 0 },
  { ...PREDEFINED_FLOURS[2], shareValue: 0 },
  { ...PREDEFINED_FLOURS[3], shareValue: 0 },
];

const PREDEFINED_LIQUIDS: Omit<LiquidSpec, 'weight'>[] = [
  { id: 'milk', name: 'Milk', isCustom: false, isPredefined: true },
];

const initialLiquidComposition = (): LiquidSpec[] => [
  { ...PREDEFINED_LIQUIDS[0], weight: 0 },
];


const initialRecipeState: Recipe = {
  name: 'New Recipe',
  flourWeight: 500,
  desiredHydrationPercentage: 65, 
  saltPercentage: 2,
  yeastPercentage: 1,
  useDetailedFlourComposition: false,
  flourComposition: initialFlourComposition(),
  useCustomLiquidBlend: false,
  liquidComposition: initialLiquidComposition(),
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

export default function DoughMasterApp({ initialRecipeName, hideLoadControls = false, hideHeroHeader = false }: { initialRecipeName?: string; hideLoadControls?: boolean; hideHeroHeader?: boolean } = {}) {
  const { toast } = useToast();
  const [recipeName, setRecipeName] = useState<string>(initialRecipeState.name);
  const [flourWeight, setFlourWeight] = useState<number>(initialRecipeState.flourWeight);
  const [desiredHydrationPercentage, setDesiredHydrationPercentage] = useState<number>(initialRecipeState.desiredHydrationPercentage);
  const [saltPercentage, setSaltPercentage] = useState<number>(initialRecipeState.saltPercentage);
  const [yeastPercentage, setYeastPercentage] = useState<number>(initialRecipeState.yeastPercentage);
  
  const [useDetailedFlourComposition, setUseDetailedFlourComposition] = useState<boolean>(initialRecipeState.useDetailedFlourComposition!);
  const [flourSpecs, setFlourSpecs] = useState<FlourSpec[]>(initialRecipeState.flourComposition!);

  const [useCustomLiquidBlend, setUseCustomLiquidBlend] = useState<boolean>(initialRecipeState.useCustomLiquidBlend!);
  const [liquidSpecs, setLiquidSpecs] = useState<LiquidSpec[]>(initialRecipeState.liquidComposition!);

  const [amendments, setAmendments] = useState<Amendment[]>(initialRecipeState.amendments);

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

  // Core calculations based on percentages
  const calculateWeightFromPercentage = useCallback((percentage: number) => {
    if (flourWeight <= 0) return 0;
    return (flourWeight * percentage) / 100;
  }, [flourWeight]);

  const saltWeight = useMemo(() => calculateWeightFromPercentage(saltPercentage), [calculateWeightFromPercentage, saltPercentage]);
  const yeastWeight = useMemo(() => calculateWeightFromPercentage(yeastPercentage), [calculateWeightFromPercentage, yeastPercentage]);
  const sugarWeight = useMemo(() => useSugar ? (flourWeight * sugarPercentageState) / 100 : 0, [useSugar, flourWeight, sugarPercentageState]);
  const butterWeight = useMemo(() => useButter ? (flourWeight * butterPercentageState) / 100 : 0, [useButter, flourWeight, butterPercentageState]);
  const oilWeight = useMemo(() => useOil ? (flourWeight * oilPercentageState) / 100 : 0, [useOil, flourWeight, oilPercentageState]);
  
  // Egg calculations
  const actualEggCount = useMemo(() => useEgg ? Math.max(1, eggCountState) : 0, [useEgg, eggCountState]);
  const totalEggWeight = useMemo(() => actualEggCount * EGG_WEIGHT_G, [actualEggCount]);
  const waterFromEggs = useMemo(() => (totalEggWeight * EGG_WATER_CONTENT_PERCENTAGE) / 100, [totalEggWeight]);


  // Liquid calculations
  const totalLiquidNeededForDesiredHydration = useMemo(() => {
    if (flourWeight <= 0) return 0;
    return (flourWeight * desiredHydrationPercentage) / 100;
  }, [flourWeight, desiredHydrationPercentage]);

  const liquidsFromSpecsWeight = useMemo(() => {
    if (!useCustomLiquidBlend) return 0;
    return liquidSpecs.reduce((sum, liquid) => sum + liquid.weight, 0);
  }, [useCustomLiquidBlend, liquidSpecs]);
  
  const actualAddedWaterWeight = useMemo(() => {
    const netLiquidNeeded = totalLiquidNeededForDesiredHydration - waterFromEggs - liquidsFromSpecsWeight;
    return Math.max(0, netLiquidNeeded); // Ensure non-negative
  }, [totalLiquidNeededForDesiredHydration, waterFromEggs, liquidsFromSpecsWeight]);


  const handleToggleUseEgg = (checked: boolean) => {
    setUseEgg(checked);
    if (checked) {
      if (eggCountState === 0) { 
        const defaultEggs = flourWeight > 0 
                            ? Math.max(1, Math.round(flourWeight / FLOUR_PER_EGG_G)) 
                            : 1; 
        setEggCountState(defaultEggs);
      }
    }
  };
  
  useEffect(() => {
    if (useEgg && eggCountState === 0) {
      setEggCountState(1);
    }
  }, [useEgg, eggCountState]);


  // Flour Composition Logic
  const calculatedFlourData = useMemo(() => {
    if (!useDetailedFlourComposition || flourWeight <= 0) {
      return [{ id: 'totalFlour', name: 'Flour (Total)', percentage: 100, weight: flourWeight, shareValue: 100, isCustom: false, isPredefined: false }];
    }
    let currentTotalShares = flourSpecs.reduce((sum, s) => sum + s.shareValue, 0);
    let specsForCalc = flourSpecs.map(s => ({ ...s }));
    if (currentTotalShares === 0 && specsForCalc.length > 0) {
      const firstPredefinedIndex = specsForCalc.findIndex(s => s.isPredefined);
      const targetIndex = firstPredefinedIndex !== -1 ? firstPredefinedIndex : 0;
      specsForCalc = specsForCalc.map((s, idx) => idx === targetIndex ? { ...s, shareValue: 1 } : { ...s, shareValue: 0 });
      currentTotalShares = 1;
    } else if (currentTotalShares === 0 && specsForCalc.length === 0) {
      return [];
    }
    return specsForCalc.map(spec => {
      const percentage = currentTotalShares > 0 ? (spec.shareValue / currentTotalShares) * 100 : 0;
      const weight = (percentage / 100) * flourWeight;
      return { ...spec, percentage, weight };
    });
  }, [flourSpecs, flourWeight, useDetailedFlourComposition]);

  const handleToggleDetailedFlourComposition = (checked: boolean) => {
    setUseDetailedFlourComposition(checked);
    if (checked && flourSpecs.length === 0) {
      setFlourSpecs(initialFlourComposition());
    }
  };
  const handleAddCustomFlour = () => setFlourSpecs([...flourSpecs, { id: crypto.randomUUID(), name: `Custom Flour ${flourSpecs.filter(fs => fs.isCustom).length + 1}`, shareValue: 0, isCustom: true, isPredefined: false }]);
  const handleUpdateFlourSpecShare = (id: string, newShareValue: number) => setFlourSpecs(prev => prev.map(s => s.id === id ? { ...s, shareValue: Math.max(0, newShareValue) } : s));
  const handleUpdateCustomFlourName = (id: string, newName: string) => setFlourSpecs(prev => prev.map(s => s.id === id && s.isCustom ? { ...s, name: newName } : s));
  const handleRemoveCustomFlour = (idToRemove: string) => {
    setFlourSpecs(prevSpecs => {
      const newSpecs = prevSpecs.filter(spec => spec.id !== idToRemove);
      const totalSharesRemaining = newSpecs.reduce((sum, s) => sum + s.shareValue, 0);
      if (newSpecs.length > 0 && totalSharesRemaining === 0) {
        const firstPredefinedIdx = newSpecs.findIndex(s => s.isPredefined);
        const targetIdx = firstPredefinedIdx !== -1 ? firstPredefinedIdx : 0;
        return newSpecs.map((s, idx) => idx === targetIdx ? { ...s, shareValue: 100 } : s);
      }
      return newSpecs.length === 0 ? initialFlourComposition() : newSpecs;
    });
  };

  // Custom Liquid Blend Logic
  const handleToggleCustomLiquidBlend = (checked: boolean) => {
    setUseCustomLiquidBlend(checked);
    if (checked && liquidSpecs.length === 0) {
      setLiquidSpecs(initialLiquidComposition());
    } 
  };
  const handleAddCustomLiquid = () => setLiquidSpecs([...liquidSpecs, { id: crypto.randomUUID(), name: `Custom Liquid ${liquidSpecs.filter(ls => ls.isCustom).length + 1}`, weight: 0, isCustom: true, isPredefined: false }]);
  const handleUpdateLiquidSpecWeight = (id: string, weight: number) => setLiquidSpecs(prev => prev.map(l => l.id === id ? { ...l, weight: Math.max(0, weight) } : l));
  const handleUpdateCustomLiquidName = (id: string, newName: string) => setLiquidSpecs(prev => prev.map(l => (l.id === id && l.isCustom ? { ...l, name: newName } : l)));
  const handleRemoveCustomLiquid = (idToRemove: string) => setLiquidSpecs(prev => prev.filter(l => l.id !== idToRemove));


  // Custom solid amendments logic
  const handleAddAmendment = () => setAmendments([...amendments, { id: crypto.randomUUID(), name: '', weight: 0 }]);
  const handleUpdateAmendmentName = (id: string, name: string) => setAmendments(prev => prev.map(am => am.id === id ? { ...am, name } : am));
  const handleUpdateAmendmentWeight = (id: string, weight: number) => setAmendments(prev => prev.map(am => am.id === id ? { ...am, weight } : am));
  const handleRemoveAmendment = (id: string) => setAmendments(prev => prev.filter(am => am.id !== id));

  // Recipe management
  const handleSaveRecipe = () => {
    if (!recipeName.trim()) {
      toast({ title: "Error", description: "Please enter a recipe name.", variant: "destructive" });
      return;
    }
    const newRecipe: Recipe = {
      name: recipeName.trim(),
      flourWeight,
      desiredHydrationPercentage, 
      saltPercentage,
      yeastPercentage,
      useDetailedFlourComposition,
      flourComposition: useDetailedFlourComposition ? flourSpecs : undefined,
      useCustomLiquidBlend,
      liquidComposition: useCustomLiquidBlend ? liquidSpecs : undefined,
      amendments,
      useSugar, sugarPercentage: sugarPercentageState,
      useEgg, eggCount: actualEggCount, 
      useButter, butterPercentage: butterPercentageState,
      useOil, oilPercentage: oilPercentageState,
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

  const applyRecipeToState = (recipeToLoad: Recipe) => {
      setRecipeName(recipeToLoad.name);
      setFlourWeight(recipeToLoad.flourWeight);
      setDesiredHydrationPercentage(recipeToLoad.desiredHydrationPercentage);
      setSaltPercentage(recipeToLoad.saltPercentage);
      setYeastPercentage(recipeToLoad.yeastPercentage);
      
      setUseDetailedFlourComposition(recipeToLoad.useDetailedFlourComposition ?? initialRecipeState.useDetailedFlourComposition!);
      setFlourSpecs(recipeToLoad.flourComposition && recipeToLoad.flourComposition.length > 0 ? recipeToLoad.flourComposition : initialFlourComposition());
      
      setUseCustomLiquidBlend(recipeToLoad.useCustomLiquidBlend ?? initialRecipeState.useCustomLiquidBlend!);
      setLiquidSpecs(recipeToLoad.liquidComposition && recipeToLoad.liquidComposition.length > 0 ? recipeToLoad.liquidComposition : initialLiquidComposition());

      setAmendments(recipeToLoad.amendments);
      
      setUseSugar(recipeToLoad.useSugar ?? initialRecipeState.useSugar!);
      setSugarPercentageState(recipeToLoad.sugarPercentage ?? initialRecipeState.sugarPercentage!);
      
      const eggCountToLoad = recipeToLoad.eggCount ?? initialRecipeState.eggCount!;
      setUseEgg(recipeToLoad.useEgg ?? initialRecipeState.useEgg!);
      setEggCountState(recipeToLoad.useEgg ? Math.max(1, eggCountToLoad) : eggCountToLoad);

      setUseButter(recipeToLoad.useButter ?? initialRecipeState.useButter!);
      setButterPercentageState(recipeToLoad.butterPercentage ?? initialRecipeState.butterPercentage!);
      setUseOil(recipeToLoad.useOil ?? initialRecipeState.useOil!);
      setOilPercentageState(recipeToLoad.oilPercentage!);
  };

  const handleLoadRecipe = () => {
    if (!selectedRecipeToLoad) {
        toast({ title: "Error", description: "Please select a recipe to load.", variant: "destructive" });
        return;
    }
    const recipeToLoad = savedRecipes.find(r => r.name === selectedRecipeToLoad);
    if (recipeToLoad) {
      applyRecipeToState(recipeToLoad);
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
    setDesiredHydrationPercentage(initialRecipeState.desiredHydrationPercentage);
    setSaltPercentage(initialRecipeState.saltPercentage);
    setYeastPercentage(initialRecipeState.yeastPercentage);

    setUseDetailedFlourComposition(initialRecipeState.useDetailedFlourComposition!);
    setFlourSpecs(initialFlourComposition());
    
    setUseCustomLiquidBlend(initialRecipeState.useCustomLiquidBlend!);
    setLiquidSpecs(initialLiquidComposition());

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
    return flourWeight + actualAddedWaterWeight + saltWeight + yeastWeight +
           sugarWeight + totalEggWeight + butterWeight + oilWeight +
           liquidsFromSpecsWeight + 
           amendments.reduce((sum, am) => sum + am.weight, 0);
  }, [flourWeight, actualAddedWaterWeight, saltWeight, yeastWeight, sugarWeight, totalEggWeight, butterWeight, oilWeight, liquidsFromSpecsWeight, amendments]);

  const overallHydrationDisplay = useMemo(() => {
      if (flourWeight <= 0) return 0;
      return desiredHydrationPercentage;
  }, [flourWeight, desiredHydrationPercentage]);


  const finalIngredientsList = useMemo(() => {
    const ingredients: { name: string; quantity: string }[] = [];
    
    if (useDetailedFlourComposition) {
      calculatedFlourData.forEach(flour => {
        if (flour.weight > 0) {
          ingredients.push({ name: flour.name, quantity: `${flour.weight.toFixed(1)}g (${flour.percentage.toFixed(1)}%)` });
        }
      });
    } else if (flourWeight > 0) {
      ingredients.push({ name: 'Flour (Total)', quantity: `${flourWeight.toFixed(1)}g` });
    }

    if (actualAddedWaterWeight > 0) ingredients.push({ name: 'Net Added Water', quantity: `${actualAddedWaterWeight.toFixed(1)}g` });
    if (useEgg && waterFromEggs > 0) ingredients.push({ name: `Water from Eggs (${actualEggCount} whole)`, quantity: `${waterFromEggs.toFixed(1)}g (contributes to hydration)` });
    
    if(useCustomLiquidBlend) {
        liquidSpecs.forEach(liquid => {
            if (liquid.weight > 0) {
                ingredients.push({ name: liquid.name, quantity: `${liquid.weight.toFixed(1)}g (contributes to hydration)` });
            }
        });
    }

    if (saltWeight > 0) ingredients.push({ name: 'Salt', quantity: `${saltWeight.toFixed(1)}g` });
    if (yeastWeight > 0) ingredients.push({ name: 'Yeast', quantity: `${yeastWeight.toFixed(Math.max(1, yeastWeight % 1 === 0 ? 1 : 2))}g` });

    if (useSugar && sugarWeight > 0) ingredients.push({ name: 'Sugar', quantity: `${sugarWeight.toFixed(1)}g` });
    
    if (useButter && butterWeight > 0) ingredients.push({ name: 'Butter', quantity: `${butterWeight.toFixed(1)}g` });
    if (useOil && oilWeight > 0) ingredients.push({ name: 'Oil', quantity: `${oilWeight.toFixed(1)}g` });

    amendments.forEach(am => {
      if (am.name.trim() && am.weight > 0) {
        ingredients.push({ name: am.name, quantity: `${am.weight.toFixed(1)}g` });
      }
    });
    return ingredients;
  }, [
    flourWeight, actualAddedWaterWeight, saltWeight, yeastWeight,
    useSugar, sugarWeight,
    useEgg, actualEggCount, waterFromEggs, 
    useButter, butterWeight,
    useOil, oilWeight,
    amendments,
    useDetailedFlourComposition, calculatedFlourData,
    useCustomLiquidBlend, liquidSpecs
  ]);

  const handlePrintRecipe = () => {
    window.print();
  };

  // Load by initialRecipeName (from route) on mount/update
  useEffect(() => {
    if (!initialRecipeName) return;
    if (!savedRecipes || savedRecipes.length === 0) return;
    const recipe = savedRecipes.find(r => r.name === initialRecipeName);
    if (recipe) {
      applyRecipeToState(recipe);
      setSelectedRecipeToLoad(recipe.name);
    }
  }, [initialRecipeName, savedRecipes]);

  const buildCurrentRecipe = (nameOverride?: string): Recipe => ({
      name: (nameOverride ?? recipeName).trim(),
      flourWeight,
      desiredHydrationPercentage,
      saltPercentage,
      yeastPercentage,
      useDetailedFlourComposition,
      flourComposition: useDetailedFlourComposition ? flourSpecs : undefined,
      useCustomLiquidBlend,
      liquidComposition: useCustomLiquidBlend ? liquidSpecs : undefined,
      amendments,
      useSugar, sugarPercentage: sugarPercentageState,
      useEgg, eggCount: actualEggCount,
      useButter, butterPercentage: butterPercentageState,
      useOil, oilPercentage: oilPercentageState,
  });

  const handleSaveAsNewRecipe = () => {
    const base = recipeName.trim() || 'New Recipe';
    let candidate = base;
    let i = 1;
    while (savedRecipes.some(r => r.name === candidate)) {
      i += 1;
      candidate = `${base} (${i})`;
    }
    const newRecipe = buildCurrentRecipe(candidate);
    setSavedRecipes([...savedRecipes, newRecipe]);
    setRecipeName(candidate);
    setSelectedRecipeToLoad(candidate);
    toast({ title: "Recipe Saved As New", description: `Saved as "${candidate}".` });
  };


  return (
    <TooltipProvider>
    <Card className="w-full max-w-3xl shadow-2xl bg-card/95 backdrop-blur-sm border-border/50">
      {!hideHeroHeader && (
        <CardHeader className="text-center pb-4 no-print">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <ChefHatIcon className="w-10 h-10 text-primary" strokeWidth={1.5} />
            <CardTitle className="text-4xl font-bold tracking-tight">DoughMaster</CardTitle>
          </div>
          <CardDescription className="text-md text-muted-foreground">Craft your perfect bread recipe.</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6 p-4 md:p-6">
        {/* Final ingredients at the very top */}
        <CardSection title="Final Recipe Ingredients">
          <div id="printableRecipeArea">
            {recipeName && recipeName.trim() && recipeName.trim().toLowerCase() !== 'new recipe' && (
              <h3 className="text-xl font-semibold mb-3 text-center">{recipeName}</h3>
            )}
            {finalIngredientsList.length > 0 ? (
              <ul className="space-y-1.5 text-sm pl-1">
                {finalIngredientsList.map((item, index) => (
                  <li key={index} className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">{item.name}:</span>
                    <span className="font-medium text-foreground bg-background/50 px-2 py-0.5 rounded-sm">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">No ingredients specified yet.</p>
            )}
          </div>
        </CardSection>

        {/* Name input just below final ingredients */}
        <CardSection title="Recipe Name" className="no-print">
          <Input id="recipeName" type="text" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g., Sandwich Rolls" className="mt-1 text-base"/>
        </CardSection>
        
        <CardSection title="Base Flour" className="no-print">
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
          <div className="mt-4 space-y-2 p-3 border rounded-md bg-background/70 shadow-sm">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="useDetailedFlourComposition"
                checked={useDetailedFlourComposition}
                onCheckedChange={(checked) => handleToggleDetailedFlourComposition(Boolean(checked))}
              />
              <Label htmlFor="useDetailedFlourComposition" className="text-sm font-medium">
                Use Detailed Flour Composition
              </Label>
            </div>
            {useDetailedFlourComposition && (
              <div className="space-y-3 pt-2">
                {calculatedFlourData.filter(f => f.id !== 'totalFlour').map((flourData) => (
                  <FlourSpecItem
                    key={flourData.id}
                    spec={{id: flourData.id, name: flourData.name, shareValue: flourData.shareValue, isCustom: flourData.isCustom, isPredefined: flourData.isPredefined}}
                    calculatedPercentage={flourData.percentage}
                    calculatedWeight={flourData.weight}
                    onShareValueChange={handleUpdateFlourSpecShare}
                    onNameChange={handleUpdateCustomFlourName}
                    onRemove={handleRemoveCustomFlour}
                    disableRemove={flourData.isCustom && calculatedFlourData.filter(f => f.shareValue > 0).length === 1 && flourData.shareValue > 0}
                  />
                ))}
                <Button onClick={handleAddCustomFlour} variant="outline" size="sm" className="w-full border-dashed hover:border-solid hover:bg-accent/20 transition-colors">
                  <WheatIcon className="mr-2 h-4 w-4" /> Add Custom Flour Type
                </Button>
              </div>
            )}
          </div>
        </CardSection>

        <CardSection title="Core Ingredients & Hydration" className="no-print">
           <IngredientSlider 
              label="Desired Hydration" 
              value={desiredHydrationPercentage} 
              onChange={setDesiredHydrationPercentage} 
              min={0} max={150} step={0.1} 
              calculatedWeight={totalLiquidNeededForDesiredHydration} 
              tooltipContent="Target total liquid percentage relative to Total Flour Weight. This includes water from eggs, milk, and other liquids you add."
            />
            <div className="mt-4 space-y-2 p-3 border rounded-md bg-background/70 shadow-sm">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="useCustomLiquidBlend"
                        checked={useCustomLiquidBlend}
                        onCheckedChange={(checked) => handleToggleCustomLiquidBlend(Boolean(checked))}
                    />
                    <Label htmlFor="useCustomLiquidBlend" className="text-sm font-medium">
                        Use Custom Liquid Blend
                    </Label>
                </div>
                {useCustomLiquidBlend && (
                    <div className="space-y-3 pt-2">
                        {liquidSpecs.filter(ls => ls.isPredefined).map((liquid) => ( 
                             <LiquidSpecItem
                                key={liquid.id}
                                liquidSpec={liquid}
                                onWeightChange={handleUpdateLiquidSpecWeight}
                            />
                        ))}
                        {liquidSpecs.filter(ls => ls.isCustom).map((liquid) => (
                            <LiquidSpecItem
                                key={liquid.id}
                                liquidSpec={liquid}
                                onNameChange={handleUpdateCustomLiquidName}
                                onWeightChange={handleUpdateLiquidSpecWeight}
                                onRemove={handleRemoveCustomLiquid}
                            />
                        ))}
                        <Button onClick={handleAddCustomLiquid} variant="outline" size="sm" className="w-full border-dashed hover:border-solid hover:bg-accent/20 transition-colors">
                            <BeakerIcon className="mr-2 h-4 w-4" /> Add Other Liquid
                        </Button>
                    </div>
                )}
                <div className="mt-3 text-sm">
                    <span className="font-medium text-foreground">
                        {useCustomLiquidBlend ? "Calculated Added Water:" : "Net Added Water (after egg reduction):"}
                    </span>
                    <span className="ml-1 font-semibold text-primary">{actualAddedWaterWeight.toFixed(1)}g</span>
                </div>
            </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4"> 
            <IngredientSlider label="Salt" value={saltPercentage} onChange={setSaltPercentage} min={0} max={5} step={0.05} calculatedWeight={saltWeight} tooltipContent="Baker's % of Total Flour Weight." />
            <IngredientSlider label="Yeast" value={yeastPercentage} onChange={setYeastPercentage} min={0} max={3} step={0.01} calculatedWeight={yeastWeight} tooltipContent="Baker's % of Total Flour Weight." />
          </div>
        </CardSection>
        
        <CardSection title="Common Additions" description="Optionally include and adjust common ingredients. Percentages are based on Total Flour Weight." className="no-print">
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
                <div className="mt-2 pl-8">
                  <Label htmlFor="sugarPercentage" className="text-xs text-muted-foreground">Baker's Percentage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="sugarPercentage"
                      type="number"
                      value={sugarPercentageState}
                      onChange={(e) => setSugarPercentageState(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-24 h-9 text-sm" min="0" step="0.1"
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
                  <span className="text-sm font-semibold text-foreground">{totalEggWeight.toFixed(0)}g total (adds ~{waterFromEggs.toFixed(1)}g water)</span>
                )}
              </div>
              {useEgg && (
                <div className="mt-2 pl-8 space-y-1">
                  <Label htmlFor="eggCount" className="text-xs text-muted-foreground">Number of whole eggs (approx. {EGG_WEIGHT_G}g each)</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="eggCount"
                      type="number"
                      value={eggCountState <= 0 && useEgg ? 1 : eggCountState} 
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10);
                        setEggCountState(isNaN(count) || count < 0 ? 0 : count);
                      }}
                      className="w-24 h-9 text-sm" 
                      min={useEgg ? "1" : "0"} 
                      step="1"
                    />
                    <span className="text-sm text-muted-foreground">count</span>
                  </div>
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
                {useButter && (<span className="text-sm font-semibold text-foreground">{butterWeight.toFixed(1)}g</span>)}
              </div>
              {useButter && (
                <div className="mt-2 pl-8">
                  <Label htmlFor="butterPercentage" className="text-xs text-muted-foreground">Baker's Percentage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input id="butterPercentage" type="number" value={butterPercentageState} onChange={(e) => setButterPercentageState(Math.max(0, parseFloat(e.target.value) || 0))} className="w-24 h-9 text-sm" min="0" step="0.1"/>
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
                {useOil && (<span className="text-sm font-semibold text-foreground">{oilWeight.toFixed(1)}g</span>)}
              </div>
              {useOil && (
                <div className="mt-2 pl-8">
                  <Label htmlFor="oilPercentage" className="text-xs text-muted-foreground">Baker's Percentage</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input id="oilPercentage" type="number" value={oilPercentageState} onChange={(e) => setOilPercentageState(Math.max(0, parseFloat(e.target.value) || 0))} className="w-24 h-9 text-sm" min="0" step="0.1"/>
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardSection>

        <CardSection title="Recipe Overview" className="no-print">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
                <span>Total Liquid (Target):</span> 
                <span className="font-semibold text-foreground">{totalLiquidNeededForDesiredHydration.toFixed(1)}g</span>
            </div>
             <div className="flex justify-between">
                <span>Net Added Water:</span> 
                <span className="font-semibold text-foreground">{actualAddedWaterWeight.toFixed(1)}g</span>
            </div>
            {useEgg && (
                 <div className="flex justify-between">
                    <span>Water from Eggs:</span> 
                    <span className="font-semibold text-foreground">{waterFromEggs.toFixed(1)}g</span>
                </div>
            )}
            {useCustomLiquidBlend && liquidSpecs.map(l => l.weight > 0 && (
                 <div key={l.id} className="flex justify-between">
                    <span>{l.name}:</span> 
                    <span className="font-semibold text-foreground">{l.weight.toFixed(1)}g</span>
                </div>
            ))}
            <Separator className="my-1" />
            <div className="flex justify-between text-base">
                <span className="font-medium">Total Dough Weight:</span> 
                <span className="font-bold text-foreground">{totalDoughWeight.toFixed(1)}g</span>
            </div>
            <div className="flex justify-between text-base">
                <span className="font-medium">Overall Hydration:</span> 
                <span className="font-bold text-foreground">{overallHydrationDisplay.toFixed(1)}%</span>
            </div>
          </div>
        </CardSection>

        

        <CardSection title="Other Solid Ingredients" description="Add any other solid ingredients not listed above." className="no-print">
          <div className="space-y-3">
            {amendments.map((am, index) => (
              <AmendmentItem key={am.id} amendment={am} onNameChange={handleUpdateAmendmentName} onWeightChange={handleUpdateAmendmentWeight} onRemove={handleRemoveAmendment} index={index} />
            ))}
            <Button onClick={handleAddAmendment} variant="outline" className="w-full border-dashed hover:border-solid hover:bg-accent/20 transition-colors">
              <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Other Solid Ingredient
            </Button>
          </div>
        </CardSection>

        <Separator className="my-6 no-print" />

        <CardSection title="Recipe Management">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 no-print">
              <Button onClick={handleSaveRecipe} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <SaveIcon className="mr-2 h-4 w-4" /> Save Current Recipe
              </Button>
              <Button onClick={handleSaveAsNewRecipe} variant="secondary" className="w-full">
                <SaveIcon className="mr-2 h-4 w-4" /> Save As New
              </Button>
              <Button onClick={handlePrintRecipe} variant="outline" className="w-full hover:bg-accent/20 transition-colors">
                <PrinterIcon className="mr-2 h-4 w-4" /> Print Recipe
              </Button>
            </div>

            {(!hideLoadControls && savedRecipes.length > 0) && (
              <div className="space-y-2 pt-2 no-print">
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
            <Button onClick={() => resetToInitialState(true)} variant="outline" className="w-full hover:bg-accent/20 transition-colors no-print">
              <RotateCcwIcon className="mr-2 h-4 w-4" /> Reset Form
            </Button>
          </div>
        </CardSection>
      </CardContent>
      <CardFooter className="text-center py-4 no-print">
        <p className="text-xs text-muted-foreground w-full">Happy Baking!</p>
      </CardFooter>
    </Card>
    </TooltipProvider>
  );
}

const CardSection: React.FC<{ title: string; description?: string; children: React.ReactNode, className?: string }> = ({ title, description, children, className }) => (
  <Card className={`bg-card/70 shadow-sm border-border/30 ${className}`}>
    <CardHeader className="pb-3 pt-4">
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      {description && <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>}
    </CardHeader>
    <CardContent className="pb-4">
      {children}
    </CardContent>
  </Card>
);
