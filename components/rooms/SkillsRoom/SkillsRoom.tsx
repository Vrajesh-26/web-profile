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
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    if (typeof track.getAnimations !== "function") return;

    let targetRate = 1;
    let currentRate = 1;
    let rafId = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();

    const tick = () => {
      currentRate += (targetRate - currentRate) * 0.12;
      targetRate += (1 - targetRate) * 0.05;

      const animations = track.getAnimations();
      if (animations.length > 0) {
        const safeRate = Number.isFinite(currentRate)
          ? Math.max(0.5, Math.min(2.0, currentRate))
          : 1;
        animations[0].playbackRate = safeRate;
      }

      if (Math.abs(currentRate - 1) > 0.01 || Math.abs(targetRate - 1) > 0.01) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentRate = 1;
        targetRate = 1;
        const animations = track.getAnimations();
        if (animations.length > 0) {
          animations[0].playbackRate = 1;
        }
        rafId = 0;
      }
    };

    const onScroll = () => {
      const now = performance.now();
      const currentScrollY = window.scrollY;
      const elapsed = Math.max(now - lastScrollTime, 16);
      const delta = Math.abs(currentScrollY - lastScrollY);
      const velocity = delta / elapsed;

      const boost = Math.min(1.0, velocity * 0.6);
      targetRate = Math.min(2.0, 1 + boost);

      lastScrollY = currentScrollY;
      lastScrollTime = now;

      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const tickerItems = [...skills, ...skills, ...skills, ...skills];

  return (
    <div
      className={styles["skills-ticker"]}
      aria-label={`Skills: ${skills.map((skill) => skill.name).join(", ")}`}
    >
      <div
        className={styles["skills-track"]}
        ref={trackRef}
        aria-hidden="true"
      >
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
