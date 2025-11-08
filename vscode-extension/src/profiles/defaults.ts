/**
 * Default profiles - same as Chrome extension
 */

import { Profile } from './types';

function createEmptyEvolution() {
  return {
    topics: [],
    lastUpdated: new Date().toISOString(),
    usageCount: 0,
    lastPrompt: "",
  };
}

export const PREDEFINED_PROFILES: Omit<Profile, 'evolving_profile'>[] = [
  {
    id: "builtin_writer",
    name: "Technical Writer",
    persona: "Senior Technical Writer",
    tone: "clear, concise",
    styleGuidelines: ["Use simple language", "Prefer examples", "No fluff"],
  },
  {
    id: "builtin_dev",
    name: "Dev Helper",
    persona: "Senior Software Engineer",
    tone: "concise, pragmatic",
    styleGuidelines: ["Show code samples", "Explain with steps", "Use bullet lists"],
  },
  {
    id: "builtin_marketing",
    name: "Marketing Copy",
    persona: "Conversion-focused Marketer",
    tone: "excited, persuasive",
    styleGuidelines: ["Short headlines", "Call to action", "A/B test variants"],
  },
];

export function getDefaultProfiles(): Profile[] {
  return PREDEFINED_PROFILES.map(p => ({
    ...p,
    evolving_profile: createEmptyEvolution(),
  }));
}

export function generateProfileId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `p_${timestamp}_${random}`;
}
