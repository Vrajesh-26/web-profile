import { describe, expect, it } from "vitest";
import { groupJourney } from "@/components/rooms/JourneyRoom/journey";

describe("Journey timeline grouping", () => {
  it("orders non-empty categories and sorts dated entries newest first", () => {
    const groups = groupJourney([
      { category: "achievement", period: "", title: "Undated", organization: "Org", description: "" },
      { category: "education", period: "Jun 2023 - Jun 2027", title: "Degree", organization: "College", description: "" },
      { category: "education", period: "Mar 2020 - Mar 2022", title: "School", organization: "School", description: "" },
      { category: "achievement", period: "Jun 2026", title: "Recent", organization: "Org", description: "" },
    ]);

    expect(groups.map((group) => group.category)).toEqual(["education", "achievement"]);
    expect(groups[0]?.entries.map((entry) => entry.title)).toEqual(["Degree", "School"]);
    expect(groups[1]?.entries.map((entry) => entry.title)).toEqual(["Recent", "Undated"]);
  });
});
