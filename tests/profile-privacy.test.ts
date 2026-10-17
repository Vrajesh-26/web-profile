import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/profile.json/route";
import { getDocuments, getJourney, getProfile, getProjects, getSkills, getSocialLinks } from "@/lib/data";

vi.mock("@/lib/data", () => ({
  getDocuments: vi.fn(),
  getJourney: vi.fn(),
  getProfile: vi.fn(),
  getProjects: vi.fn(),
  getSkills: vi.fn(),
  getSocialLinks: vi.fn(),
}));

describe("public profile privacy", () => {
  beforeEach(() => {
    vi.mocked(getProfile).mockResolvedValue({
      firstName: "Public",
      lastName: "Profile",
      role: "Developer",
      availability: "Open to roles",
      intro: "A public profile.",
      portraitAlt: "Portrait",
      bio: "Public bio.",
      now: "Building useful things.",
      location: "Remote",
      email: "private@example.test",
      phone: "+1 202 555 0147",
    } as unknown as Awaited<ReturnType<typeof getProfile>>);
    vi.mocked(getSkills).mockResolvedValue([]);
    vi.mocked(getProjects).mockResolvedValue([]);
    vi.mocked(getJourney).mockResolvedValue([]);
    vi.mocked(getDocuments).mockResolvedValue([]);
    vi.mocked(getSocialLinks).mockResolvedValue([]);
  });

  it("serializes only public profile fields and excludes private contact values", async () => {
    const response = await GET();
    const serialized = await response.text();
    const payload = JSON.parse(serialized) as { profile: Record<string, unknown> };

    expect(payload.profile).not.toHaveProperty("email");
    expect(payload.profile).not.toHaveProperty("phone");
    expect(serialized).not.toContain("private@example.test");
    expect(serialized).not.toContain("+1 202 555 0147");
    expect(serialized).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(serialized).not.toMatch(/\+?\d[\d\s().-]{8,}\d/);
  });
});