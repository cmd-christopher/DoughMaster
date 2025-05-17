
"use client";

import type { FC } from 'react';
import type { FlourSpec } from '@/lib/types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { XIcon, Edit3Icon, SaveIcon, CircleIcon } from "lucide-react";
import { Card, CardContent } from '@/components/ui/card'; // For consistent item background
import { useState, useEffect } from 'react';

interface FlourSpecItemProps {
  spec: Pick<FlourSpec, 'id' | 'name' | 'shareValue' | 'isCustom' | 'isPredefined'>; // Use Pick for clarity
  calculatedPercentage: number;
  calculatedWeight: number;
  onShareValueChange: (id: string, newShareValue: number) => void;
  onNameChange: (id: string, newName: string) => void;
  onRemove: (id: string) => void;
  disableRemove?: boolean;
}

const FlourSpecItem: FC<FlourSpecItemProps> = ({
  spec,
  calculatedPercentage,
  calculatedWeight,
  onShareValueChange,
  onNameChange,
  onRemove,
  disableRemove = false,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState(spec.name);
  const [localShareValue, setLocalShareValue] = useState(spec.shareValue);

  useEffect(() => {
    setLocalShareValue(spec.shareValue); // Sync with parent if prop changes
  }, [spec.shareValue]);
  
  useEffect(() => {
    setEditableName(spec.name); // Sync name if spec.name changes (e.g. load recipe)
  }, [spec.name]);

  const handleShareInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const newShare = isNaN(val) || val < 0 ? 0 : (val > 100 ? 100 : val) ; // Clamp between 0 and 100
    setLocalShareValue(newShare);
    onShareValueChange(spec.id, newShare);
  };

  const handleSliderChange = (value: number[]) => {
    const newShare = value[0];
    setLocalShareValue(newShare);
    onShareValueChange(spec.id, newShare);
  };
  
  const handleNameSave = () => {
    if (editableName.trim() === "") {
        setEditableName(spec.name); // Reset to original if empty
    } else {
        onNameChange(spec.id, editableName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <Card className="p-3 bg-background/80 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-0 space-y-2">
        <div className="flex items-center justify-between">
          {isEditingName && spec.isCustom ? (
            <div className="flex items-center space-x-1 flex-grow">
              <Input
                type="text"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="h-8 text-sm flex-grow"
                autoFocus
                aria-label={`${spec.name} name input`}
              />
              <Button variant="ghost" size="icon" onClick={handleNameSave} className="h-8 w-8 text-primary">
                <SaveIcon className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Label htmlFor={`${spec.id}-share`} className="text-sm font-medium flex items-center">
              {spec.isPredefined && <CircleIcon className="h-2 w-2 mr-1.5 fill-muted-foreground text-muted-foreground" />}
              {spec.name}
              {spec.isCustom && (
                <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)} className="ml-1 h-6 w-6 text-muted-foreground hover:text-foreground">
                  <Edit3Icon className="h-3 w-3" />
                </Button>
              )}
            </Label>
          )}
          {spec.isCustom && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(spec.id)}
              disabled={disableRemove}
              className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors h-8 w-8"
              aria-label={`Remove ${spec.name}`}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Slider
            id={`${spec.id}-share-slider`}
            value={[localShareValue]}
            onValueChange={handleSliderChange}
            min={0}
            max={100} // Share values are 0-100
            step={1}
            className="flex-grow"
            aria-label={`${spec.name} share slider`}
          />
          <Input
            id={`${spec.id}-share-input`}
            type="number"
            value={localShareValue} // Controlled by local state for responsiveness
            onChange={handleShareInputChange}
            className="w-20 h-8 text-xs text-right"
            min="0"
            max="100"
            step="1"
            aria-label={`${spec.name} share input`}
          />
        </div>
        <div className="text-xs text-muted-foreground flex justify-between items-center">
          <span>Calculated: <span className="font-medium text-foreground">{calculatedPercentage.toFixed(1)}%</span></span>
          <span>Weight: <span className="font-medium text-foreground">{calculatedWeight.toFixed(1)}g</span></span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlourSpecItem;

