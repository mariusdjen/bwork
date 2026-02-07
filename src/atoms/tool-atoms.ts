import { atom } from "jotai";
import type { ArtifactBase } from "@/types/artifact";

type CurrentTool = {
  id: string;
  name: string;
  artifact: ArtifactBase;
};

export const currentToolAtom = atom<CurrentTool | null>(null);
