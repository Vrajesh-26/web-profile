import { RoomShell } from "@/components/rooms/RoomShell";
import { getRooms } from "@/lib/data";

export default function Home() {
  const rooms = getRooms();

  return (
    <main className="page-shell">
      <header className="page-intro">
        <h1>A profile, thoughtfully told.</h1>
        <p>
          A place to bring together the work, ideas, and experiences that make
          up my story.
        </p>
      </header>
      {rooms.map((room) => (
        <RoomShell key={room.slug} room={room} />
      ))}
    </main>
  );
}