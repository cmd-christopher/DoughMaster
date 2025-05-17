"use client";

import type { FC } from 'react';
import type { Amendment } from '@/lib/types';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

interface AmendmentItemProps {
  amendment: Amendment;
  onNameChange: (id: string, name: string) => void;
  onWeightChange: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
  index: number;
}

const AmendmentItem: FC<AmendmentItemProps> = ({
  amendment,
  onNameChange,
  onWeightChange,
  onRemove,
  index,
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-background/50 rounded-md border border-border transition-all duration-300">
      <Input
        type="text"
        placeholder="e.g. Sugar"
        value={amendment.name}
        onChange={(e) => onNameChange(amendment.id, e.target.value)}
        className="flex-grow h-9 text-sm"
        aria-label={`Amendment ${index + 1} name`}
      />
      <Input
        type="number"
        placeholder="g"
        value={amendment.weight === 0 && !amendment.name ? "" : amendment.weight} // Show placeholder if weight is 0 and name is empty
        onChange={(e) => {
          const weight = parseFloat(e.target.value);
          onWeightChange(amendment.id, isNaN(weight) || weight < 0 ? 0 : weight);
        }}
        className="w-24 h-9 text-sm text-right"
        min="0"
        step="0.1"
        aria-label={`Amendment ${index + 1} weight`}
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(amendment.id)}
        aria-label={`Remove amendment ${index + 1}`}
        className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
      >
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AmendmentItem;
