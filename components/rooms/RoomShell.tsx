import type { RoomSeed } from "@/lib/data";
import styles from "./RoomShell.module.css";

type RoomShellProps = {
  room: RoomSeed;
};

export function RoomShell({ room }: RoomShellProps) {
  return (
    <section id={room.slug} className={styles["room-shell"]} data-accent={room.accent}>
      <h2>{room.title}</h2>
      <p>{room.description}</p>
    </section>
  );
}
