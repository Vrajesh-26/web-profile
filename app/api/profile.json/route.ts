import { NextResponse } from "next/server";
import { getDocuments, getJourney, getProfile, getProjects, getSkills, getSocialLinks } from "@/lib/data";

export async function GET() {
  const [publicProfile, publicSkills, publicProjects, publicJourney, publicDocuments, links] = await Promise.all([
    getProfile(), getSkills(), getProjects(), getJourney(), getDocuments(), getSocialLinks(),
  ]);

  return NextResponse.json({
    profile: {
      name: `${publicProfile.firstName} ${publicProfile.lastName}`,
      headline: publicProfile.role,
      tagline: publicProfile.intro,
      bio: publicProfile.bio,
      location: publicProfile.location,
      availability: publicProfile.availability,
      now: publicProfile.now,
    },
    skills: publicSkills,
    projects: publicProjects,
    journey: publicJourney,
    documents: publicDocuments,
    socialLinks: links,
  }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}