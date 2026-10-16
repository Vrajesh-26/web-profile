import type { ProfileSeed } from "@/lib/data";
import styles from "./AboutRoom.module.css";

export function AboutRoom({ profile }: { profile: ProfileSeed }) {
  return (
    <section
      className={styles["about-room"]}
      id="welcome"
      aria-labelledby="about-title"
    >
      <div className={styles["about-heading"]}>
        <p className={styles["eyebrow"]}>A little context</p>
        <h2 id="about-title">Good work starts with good questions.</h2>
      </div>
      <div className={styles["about-copy"]}>
        <p>{profile.bio}</p>
        <div className={styles["now-strip"]}>
          <span className={styles["now-marker"]} aria-hidden="true" />
          <div>
            <p className={styles["eyebrow"]}>Now</p>
            <p>{profile.now}</p>
          </div>
        </div>
        <p className={styles["about-location"]}>{profile.location}</p>
      </div>
    </section>
  );
}
