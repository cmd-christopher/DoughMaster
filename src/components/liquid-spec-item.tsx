
"use client";

import type { FC } from 'react';
import type { LiquidSpec } from '@/lib/types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { XIcon, Edit3Icon, SaveIcon, DropletIcon } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

interface LiquidSpecItemProps {
  liquidSpec: LiquidSpec;
  onNameChange?: (id: string, newName: string) => void; // Optional: only for custom
  onWeightChange: (id: string, weight: number) => void;
  onRemove?: (id: string) => void; // Optional: only for custom
  // index: number; // May not be needed if we don't use it for aria-labels specific to index
}

const LiquidSpecItem: FC<LiquidSpecItemProps> = ({
  liquidSpec,
  onNameChange,
  onWeightChange,
  onRemove,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(liquidSpec.name);

  useEffect(() => {
    setEditableName(liquidSpec.name);
  }, [liquidSpec.name]);

  const handleNameSave = () => {
    if (editableName.trim() === "") {
      setEditableName(liquidSpec.name); // Reset to original if empty
    } else {
      onNameChange?.(liquidSpec.id, editableName.trim());
    }
    setIsEditingName(false);
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const weight = parseFloat(e.target.value);
    onWeightChange(liquidSpec.id, isNaN(weight) || weight < 0 ? 0 : weight);
  };

  return (
    <Card className="p-3 bg-background/80 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0 space-y-2">
        <div className="flex items-center justify-between">
          {isEditingName && liquidSpec.isCustom && onNameChange ? (
            <div className="flex items-center space-x-1 flex-grow">
              <Input
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="h-8 text-sm flex-grow"
                autoFocus
                aria-label={`${liquidSpec.name} name input`}
              />
              <Button variant="ghost" size="icon" onClick={handleNameSave} className="h-8 w-8 text-primary">
                <SaveIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Label htmlFor={`${liquidSpec.id}-weight`} className="text-sm font-medium flex items-center">
              {!liquidSpec.isCustom && <DropletIcon className="h-3 w-3 mr-1.5 text-muted-foreground" />}
              {liquidSpec.name}
              {liquidSpec.isCustom && onNameChange && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="ml-1 h-6 w-6 text-muted-foreground hover:text-foreground">
                  <Edit3Icon className="h-3 w-3" />
                </Button>
              )}
            </Label>
          )}
          {liquidSpec.isCustom && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(liquidSpec.id)}
              className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors h-8 w-8"
              aria-label={`Remove ${liquidSpec.name}`}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            id={`${liquidSpec.id}-weight`}
            type="number"
            placeholder="grams"
            value={liquidSpec.weight === 0 ? "" : liquidSpec.weight}
            onChange={handleWeightChange}
            className="w-full h-9 text-sm text-right"
            min="0"
            step="0.1"
            aria-label={`${liquidSpec.name} weight input`}
          />
          <span className="text-sm text-muted-foreground">g</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiquidSpecItem;
