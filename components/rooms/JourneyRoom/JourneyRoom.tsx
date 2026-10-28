import type { JourneySeed } from "@/lib/data";
import { Award, Briefcase, GraduationCap, Trophy, type LucideIcon } from "lucide-react";
import { groupJourney, type JourneyGroup } from "./journey";
import styles from "./JourneyRoom.module.css";

const categoryDetails: Record<JourneyGroup["category"], { label: string; lane: "left" | "right"; Icon: LucideIcon }> = {
  education: { label: "Education", lane: "left", Icon: GraduationCap },
  experience: { label: "Experience", lane: "right", Icon: Briefcase },
  certification: { label: "Certifications", lane: "left", Icon: Award },
  achievement: { label: "Achievements", lane: "right", Icon: Trophy },
};

export function JourneyRoom({ journey }: { journey: readonly JourneySeed[] }) {
  const groups = groupJourney(journey);

  return (
    <section className={styles["journey-room"]} id="journey" aria-labelledby="journey-title">
      <div className={styles["journey-heading"]}>
        <p className={styles.eyebrow}>A few chapters</p>
        <h2 id="journey-title">Still learning as I go.</h2>
      </div>
      <div className={styles["journey-grid"]}>
        <p className={`${styles["lane-label"]} ${styles["lane-label-left"]}`}>Learning</p>
        <p className={`${styles["lane-label"]} ${styles["lane-label-right"]}`}>Building</p>
        {groups.map((group, index) => {
          const { category, entries } = group;
          const { label, lane, Icon } = categoryDetails[category];
          return (
            <section
              className={`${styles["journey-group"]} ${styles[`category-${category}`]} ${styles[`lane-${lane}`]}`}
              key={category}
              style={{ "--journey-delay": `${index * 90}ms` } as React.CSSProperties}
              aria-labelledby={`journey-${category}`}
            >
              <span className={styles["journey-node"]} aria-hidden="true"><Icon /></span>
              <h3 id={`journey-${category}`}>{label}</h3>
              <ol className={styles["journey-entries"]}>
                {entries.map((item) => (
                  <li className={styles["journey-entry"]} key={`${item.period}-${item.title}`}>
                    {item.period && <p className={styles["journey-period"]}>{item.period}</p>}
                    <h4>{item.title}</h4>
                    <p className={styles["journey-organization"]}>{item.organization}</p>
                    <p className={styles["journey-description"]}>{item.description}</p>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </section>
  );
}
