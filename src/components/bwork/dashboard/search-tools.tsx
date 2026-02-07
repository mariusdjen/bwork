"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchToolsProps = {
  onSearch: (query: string) => void;
};

export function SearchTools({ onSearch }: SearchToolsProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Rechercher un outil..."
        className="pl-9"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
