import { AboutRoom } from "@/components/rooms/AboutRoom/AboutRoom";
import { ContactRoom } from "@/components/rooms/ContactRoom/ContactRoom";
import { DocumentsRoom } from "@/components/rooms/DocumentsRoom/DocumentsRoom";
import { JourneyRoom } from "@/components/rooms/JourneyRoom/JourneyRoom";
import { WorkRooms } from "@/components/rooms/WorkRooms/WorkRooms";
import { Hero } from "@/components/site/Hero";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  getDocuments,
  getJourney,
  getMenuRooms,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import styles from "./page.module.css";

export default async function Home() {
  const [profile, menuRooms, skills, projects, journey, documents] = await Promise.all([
    getProfile(),
    getMenuRooms(),
    getSkills(),
    getProjects(),
    getJourney(),
    getDocuments(),
  ]);

  return (
    <>
      <SiteHeader
        menuRooms={menuRooms}
        wordmark={`${profile.firstName} ${profile.lastName}`}
      />
      <main>
        <Hero profile={profile} />
        <div className={styles["page-shell"]}>
          <AboutRoom profile={profile} />
          <WorkRooms skills={skills} projects={projects} />
          <JourneyRoom journey={journey} />
          <DocumentsRoom documents={documents} />
          <ContactRoom />
        </div>
      </main>
    </>
  );
}