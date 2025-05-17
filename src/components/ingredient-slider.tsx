
"use client";

import type { FC } from 'react';
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";


interface IngredientSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  calculatedWeight: number;
  tooltipContent?: string;
}

const IngredientSlider: FC<IngredientSliderProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.1,
  unit = "%",
  calculatedWeight,
  tooltipContent,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      if (numValue >= min && numValue <= max) {
        onChange(numValue);
      } else if (numValue < min) {
        onChange(min);
      } else {
        onChange(max);
      }
    }
  };
  
  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
     if (isNaN(numValue) || numValue < min) {
        onChange(min); // Reset to min if invalid or below min
      } else if (numValue > max) {
        onChange(max); // Reset to max if above max
      }
      // If valid and within bounds, it's already handled by onChange from handleInputChange
  };

  // Determine the number of decimal places for display based on the step or label
  const displayPrecision = label === 'Yeast' ? 2 : (step < 1 ? 1 : 0);


  return (
    <Card className="bg-card shadow-md transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-md font-semibold flex items-center justify-between">
          {label}
          {tooltipContent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor={`${label}-slider`} className="text-xs flex-shrink-0">
            {value.toFixed(displayPrecision)}{unit}
          </Label>
          <Input
            type="number"
            id={`${label}-input`}
            value={value.toFixed(displayPrecision)}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={step}
            className="w-20 h-8 text-xs text-right"
            aria-label={`${label} percentage input`}
          />
        </div>
        <Slider
          id={`${label}-slider`}
          value={[value]}
          onValueChange={(newValue) => onChange(newValue[0])}
          min={min}
          max={max}
          step={step}
          aria-label={`${label} percentage slider`}
        />
        <p className="text-xs text-muted-foreground">
          Total Weight: <span className="font-medium text-foreground">{calculatedWeight.toFixed(1)}g</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default IngredientSlider;
