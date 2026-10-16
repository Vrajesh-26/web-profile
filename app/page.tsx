import { RoomShell } from "@/components/rooms/RoomShell";
import { Hero } from "@/components/site/Hero";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getMenuRooms, getProfile, getRooms } from "@/lib/data";
import styles from "./page.module.css";

export default function Home() {
  const rooms = getRooms();
  const profile = getProfile();

  return (
    <>
      <SiteHeader
        menuRooms={getMenuRooms()}
        wordmark={`${profile.firstName} ${profile.lastName}`}
      />
      <main>
        <Hero profile={profile} />
        <div className={styles["page-shell"]}>
          {rooms.map((room) => (
            <RoomShell key={room.slug} room={room} />
          ))}
        </div>
      </main>
    </>
  );
}