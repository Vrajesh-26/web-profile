import { getDocuments, getJourney, getProfile, getProjects, getSkills, getSocialLinks } from "@/lib/data";
import { getSiteUrl } from "@/lib/seo/site-url";

export async function GET() {
  const [profile, skills, projects, journey, documents, links] = await Promise.all([
    getProfile(), getSkills(), getProjects(), getJourney(), getDocuments(), getSocialLinks(),
  ]);
  const base = getSiteUrl().origin;
  const lines = [
    `# ${profile.firstName} ${profile.lastName}`,
    "",
    `> ${profile.role}. ${profile.intro}`,
    "",
    "## Profile",
    profile.bio,
    `Location: ${profile.location}`,
    `Availability: ${profile.availability}`,
    "",
    "## Skills",
    skills.map((skill) => `- ${skill.name} (${skill.category})`).join("\n"),
    "",
    "## Projects",
    ...projects.map((project) => `- [${project.title}](${base}/projects/${project.slug}): ${project.description}`),
    "",
    "## Journey",
    ...journey.map((item) => `- ${item.period}: ${item.title}, ${item.organization}. ${item.description}`),
    "",
    "## Public documents",
    ...documents.map((document) => `- ${document.title}${document.previewUrl ? ` (${document.previewUrl})` : ""}: ${document.description}`),
    "",
    "## Links",
    `- Website: ${base}`,
    `- Public profile JSON: ${base}/api/profile.json`,
    `- Agent access information: ${base}/agents`,
    ...links.map((link) => `- ${link.label}: ${link.url}`),
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}