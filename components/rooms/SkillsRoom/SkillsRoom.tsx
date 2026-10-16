"use client";

import { useEffect, useRef } from "react";
import type { SkillSeed } from "@/lib/data";
import styles from "./SkillsRoom.module.css";

type SkillsRoomProps = {
  skills: readonly SkillSeed[];
  selectedSkill: string | null;
  onSkillSelect: (skill: string | null) => void;
};

function SkillsTicker({ skills }: { skills: readonly SkillSeed[] }) {
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let previousY = window.scrollY;
    let previousTime = performance.now();
    let frame = 0;

    const updateTicker = () => {
      const now = performance.now();
      const currentY = window.scrollY;
      const elapsed = Math.max(now - previousTime, 1);
      const velocity = Math.abs(currentY - previousY) / elapsed;
      const duration = Math.max(7, Math.min(24, 24 / (1 + velocity * 1.5)));

      ticker.style.setProperty("--ticker-duration", `${duration}s`);
      ticker.style.setProperty(
        "--ticker-direction",
        currentY < previousY ? "reverse" : "normal",
      );
      previousY = currentY;
      previousTime = now;
      frame = 0;
    };

    const onScroll = () => {
      if (!reducedMotion.matches && frame === 0) {
        frame = window.requestAnimationFrame(updateTicker);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const tickerItems = [...skills, ...skills];

  return (
    <div
      className={styles["skills-ticker"]}
      ref={tickerRef}
      aria-label={`Skills: ${skills.map((skill) => skill.name).join(", ")}`}
    >
      <div className={styles["skills-track"]} aria-hidden="true">
        {tickerItems.map((skill, index) => (
          <span key={`${skill.name}-${index}`}>
            {skill.name}
            <span className={styles["ticker-separator"]}>✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function SkillsRoom({
  skills,
  selectedSkill,
  onSkillSelect,
}: SkillsRoomProps) {
  const categories = [...new Set(skills.map((skill) => skill.category))];

  return (
    <section className={styles["skills-room"]} id="skills" aria-labelledby="skills-title">
      <div className={styles["skills-intro"]}>
        <p className={styles["eyebrow"]}>Tools I reach for</p>
        <h2 id="skills-title">A toolkit, not a checklist.</h2>
        <p>
          I like choosing the simplest tools that make an idea clear, useful,
          and ready to grow.
        </p>
      </div>
      <SkillsTicker skills={skills} />
      <div className={styles["skill-filter"]}>
        <div className={styles["filter-heading"]}>
          <h3>Find a thread</h3>
          <p>Choose a skill to see where it shows up in my work.</p>
        </div>
        {categories.map((category) => (
          <div className={styles["skill-category"]} key={category}>
            <h4>{category}</h4>
            <div className={styles["skill-list"]}>
              {skills
                .filter((skill) => skill.category === category)
                .map((skill) => {
                  const isSelected = selectedSkill === skill.name;
                  return (
                    <button
                      className={`${styles["skill-tag"]}${isSelected ? ` ${styles["is-selected"]}` : ""}`}
                      key={skill.name}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        onSkillSelect(isSelected ? null : skill.name)
                      }
                    >
                      {skill.name}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
        {selectedSkill && (
          <button
            className={styles["clear-filter"]}
            type="button"
            onClick={() => onSkillSelect(null)}
          >
            Clear filter <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </section>
  );
}
