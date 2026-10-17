import { AboutRoom } from "@/components/rooms/AboutRoom/AboutRoom";
import { ContactRoom } from "@/components/rooms/ContactRoom/ContactRoom";
import { DocumentsRoom } from "@/components/rooms/DocumentsRoom/DocumentsRoom";
import { JourneyRoom } from "@/components/rooms/JourneyRoom/JourneyRoom";
import { WorkRooms } from "@/components/rooms/WorkRooms/WorkRooms";
import { Hero } from "@/components/site/Hero";
import { SiteHeader } from "@/components/site/SiteHeader";
import { isPublicWebUrl } from "@/lib/seo/site-url";
import {
  getDocuments,
  getJourney,
  getMenuRooms,
  getProfile,
  getProjects,
  getSkills,
  getSocialLinks,
} from "@/lib/data";
import styles from "./page.module.css";

export default async function Home() {
  const [profile, menuRooms, skills, projects, journey, documents, links] = await Promise.all([
    getProfile(),
    getMenuRooms(),
    getSkills(),
    getProjects(),
    getJourney(),
    getDocuments(),
    getSocialLinks(),
  ]);
  const sameAs = links.map((link) => link.url).filter(isPublicWebUrl);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: `${profile.firstName} ${profile.lastName}`,
        jobTitle: profile.role,
        description: profile.intro,
        homeLocation: { "@type": "Place", name: profile.location },
        sameAs,
      },
      { "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: `${profile.firstName} ${profile.lastName}` },
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profile`,
        url: siteUrl,
        mainEntity: { "@id": `${siteUrl}/#person` },
        isPartOf: { "@id": `${siteUrl}/#website` },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <SiteHeader
        menuRooms={menuRooms}
        wordmark={`${profile.firstName} ${profile.lastName}`}
      />
      <main id="main-content" tabIndex={-1}>
        <Hero profile={profile} />
        <div className={styles["page-shell"]}>
          <AboutRoom profile={profile} />
          <WorkRooms skills={skills} projects={projects} />
          <JourneyRoom journey={journey} />
          <DocumentsRoom documents={documents} />
          <ContactRoom siteKey={process.env.TURNSTILE_SITE_KEY ?? ""} />
        </div>
      </main>
    </>
  );
}