import { atom } from "jotai";

export type GeneratingTool = {
  id: string;
  name: string;
};

/** List of tools currently in "generating" status for the user's org */
export const generatingToolsAtom = atom<GeneratingTool[]>([]);
