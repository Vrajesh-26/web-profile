import type { JourneySeed } from "@/lib/data";
import styles from "./JourneyRoom.module.css";

export function JourneyRoom({ journey }: { journey: readonly JourneySeed[] }) {
  return (
    <section
      className={styles["journey-room"]}
      id="journey"
      aria-labelledby="journey-title"
    >
      <div className={styles["journey-heading"]}>
        <p className={styles["eyebrow"]}>A few chapters</p>
        <h2 id="journey-title">Still learning as I go.</h2>
      </div>
      <ol className={styles["journey-list"]}>
        {journey.map((item, index) => (
          <li className={styles["journey-item"]} key={`${item.period}-${item.title}`}>
            <span className={styles["journey-marker"]} aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className={styles["journey-copy"]}>
              <p className={styles["journey-period"]}>{item.period}</p>
              <h3>{item.title}</h3>
              <p className={styles["journey-organization"]}>{item.organization}</p>
              <p>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
