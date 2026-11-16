import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our token class names, so `text-body` is seen as a font size
// (not a color) and `shadow-elevation-2` as a shadow.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "h3", "title", "subtitle", "body", "caption"] }],
      shadow: [{ shadow: ["elevation-1", "elevation-2", "elevation-3", "elevation-4"] }],
    },
  },
});

/** Joins class names and resolves Tailwind conflicts (the last class wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
