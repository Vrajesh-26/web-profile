import type { RoomSeed } from "@/lib/data";

type RoomShellProps = {
  room: RoomSeed;
};

export function RoomShell({ room }: RoomShellProps) {
  return (
    <section className="room-shell" data-accent={room.accent}>
      <h2>{room.title}</h2>
      <p>{room.description}</p>
    </section>
  );
}
