import type { JourneyCategory, JourneySeed } from "@/lib/data";

export const journeyCategoryOrder = ["education", "experience", "certification", "achievement"] as const;

export type JourneyGroup = {
  category: JourneyCategory;
  entries: readonly JourneySeed[];
};

function dateValue(period: string) {
  const startDate = period.split(/\s[-–]\s/)[0]?.trim();
  if (!startDate) return null;
  const value = Date.parse(`${startDate} 1`);
  return Number.isNaN(value) ? null : value;
}

export function groupJourney(entries: readonly JourneySeed[]): readonly JourneyGroup[] {
  return journeyCategoryOrder.flatMap((category) => {
    const sorted = entries
      .map((entry, index) => ({ entry, index, date: dateValue(entry.period) }))
      .filter(({ entry }) => entry.category === category)
      .sort((left, right) => {
        if (left.date !== null && right.date !== null) return right.date - left.date || left.index - right.index;
        if (left.date !== null) return -1;
        if (right.date !== null) return 1;
        return left.index - right.index;
      })
      .map(({ entry }) => entry);
    return sorted.length ? [{ category, entries: sorted }] : [];
  });
}
