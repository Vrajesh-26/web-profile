"use client";

import { useEffect, useRef, useState } from "react";
import type { ProfileSeed } from "@/lib/data";
import styles from "./Hero.module.css";

type HeroProps = {
  profile: ProfileSeed;
};

export function PointerType({
  firstName,
  lastName,
}: Pick<ProfileSeed, "firstName" | "lastName">) {
  const nameRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (reducedMotion.matches || !coarsePointer.matches) return;

    const updateForScroll = () => {
      const letters = nameRef.current?.querySelectorAll<HTMLElement>(
        "[data-pointer-letter]",
      );
      if (!letters) return;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      const width = 75 + Math.min(progress, 1) * 65;
      letters.forEach((letter) => {
        letter.style.fontVariationSettings = `"wdth" ${width}, "wght" 500`;
      });
    };

    window.addEventListener("scroll", updateForScroll, { passive: true });
    window.addEventListener("resize", updateForScroll);
    updateForScroll();
    return () => {
      window.removeEventListener("scroll", updateForScroll);
      window.removeEventListener("resize", updateForScroll);
    };
  }, []);

  function setLetterVariation(clientX: number, clientY: number) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const letters = nameRef.current?.querySelectorAll<HTMLElement>(
      "[data-pointer-letter]",
    );
    letters?.forEach((letter) => {
      const bounds = letter.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const distance = Math.hypot(clientX - centerX, clientY - centerY);
      const influence = Math.max(0, 1 - distance / 180);
      const width = 100 + influence * 45;
      const weight = 500 + influence * 260;
      letter.style.fontVariationSettings = `"wdth" ${width}, "wght" ${weight}`;
    });
  }

  function resetLetterVariation() {
    nameRef.current
      ?.querySelectorAll<HTMLElement>("[data-pointer-letter]")
      .forEach((letter) => {
        letter.style.fontVariationSettings = "";
      });
  }

  function renderName(name: string, row: number) {
    return Array.from(name).map((letter, index) => (
      <span
        key={`${row}-${index}`}
        className={styles["hero-letter"]}
        data-pointer-letter
        aria-hidden="true"
        style={{ animationDelay: `${(row * name.length + index) * 28}ms` }}
      >
        {letter}
      </span>
    ));
  }

  return (
    <h1
      ref={nameRef}
      id="hero-title"
      className={styles["hero-name"]}
      aria-label={`${firstName} ${lastName}`}
      onPointerMove={(event) => {
        if (event.pointerType !== "touch") {
          setLetterVariation(event.clientX, event.clientY);
        }
      }}
      onPointerLeave={resetLetterVariation}
    >
      <span className={styles["hero-name-row"]}>{renderName(firstName, 0)}</span>
      <span className={styles["hero-name-row"]}>{renderName(lastName, 1)}</span>
    </h1>
  );
}

export function PortraitMask({
  alt,
  src,
}: {
  alt: string;
  src?: string | null;
}) {
  const [imageError, setImageError] = useState(false);
  const showCustomImage = Boolean(src) && !imageError;

  return (
    <div className={styles["portrait-mask"]}>
      <svg
        className={styles["portrait-art"]}
        viewBox="0 0 520 620"
        role="img"
        aria-label={alt}
      >
        <defs>
          <clipPath id="portrait-arch">
            <path d="M42 578V242C42 118 139 28 260 28s218 90 218 214v336z" />
          </clipPath>
          <linearGradient id="portrait-sky" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#d69b36" />
            <stop offset="1" stopColor="#8b637e" />
          </linearGradient>
        </defs>
        <g clipPath="url(#portrait-arch)">
          {showCustomImage ? (
            <image
              href={src!}
              x="42"
              y="28"
              width="436"
              height="550"
              preserveAspectRatio="xMidYMid slice"
              onError={() => setImageError(true)}
            />
          ) : (
            <>
              <path fill="url(#portrait-sky)" d="M0 0h520v620H0z" />
              <circle cx="394" cy="134" r="62" fill="#f4f0e6" opacity=".65" />
              <path
                d="M0 427c82-62 133-74 206-23 77 54 121 45 314-48v264H0z"
                fill="#49664e"
                opacity=".72"
              />
              <path d="M97 620c17-124 72-196 163-196s146 72 163 196z" fill="#243b2d" />
              <path
                d="M175 260c0-67 34-111 85-111s85 44 85 111v32c0 63-36 108-85 108s-85-45-85-108z"
                fill="#c8815c"
              />
              <path
                d="M165 267c-14-92 26-155 102-155 66 0 97 50 93 120-24-28-54-40-87-40-29 30-63 44-108 42z"
                fill="#243b2d"
              />
              <path d="M222 295h2m74 0h2" stroke="#243b2d" strokeLinecap="round" strokeWidth="8" />
              <path
                d="M239 333c13 10 29 10 42 0"
                fill="none"
                stroke="#8c4d3d"
                strokeLinecap="round"
                strokeWidth="6"
              />
            </>
          )}
        </g>
        <path
          d="M42 578V242C42 118 139 28 260 28s218 90 218 214v336"
          fill="none"
          stroke="#f4f0e6"
          strokeOpacity=".72"
          strokeWidth="2"
        />
      </svg>
      <span className={styles["portrait-caption"]} aria-hidden="true">
        A little more human, by design.
      </span>
    </div>
  );
}

export function AvailabilityPill({ label }: { label: string }) {
  return (
    <span className={styles["availability-pill"]}>
      <span className={styles["availability-dot"]} aria-hidden="true" />
      {label}
    </span>
  );
}

export function Hero({ profile }: HeroProps) {
  return (
    <section className={styles.hero} id="home" aria-labelledby="hero-title">
      <div className={styles["hero-copy"]}>
        <AvailabilityPill label={profile.availability} />
        <PointerType
          firstName={profile.firstName}
          lastName={profile.lastName}
        />
        <p className={styles["hero-role"]}>
          {profile.role}
        </p>
        <p className={styles["hero-intro"]}>{profile.intro}</p>
        <div className={styles["hero-actions"]}>
          <a className={`${styles["hero-cta"]} ${styles["hero-cta-primary"]}`} href="#projects">
            View projects
          </a>
          <a className={`${styles["hero-cta"]} ${styles["hero-cta-secondary"]}`} href="#documents">
            Open resume
          </a>
        </div>
      </div>
      <PortraitMask alt={profile.portraitAlt} src={profile.avatarUrl} />
      <span className={styles["hero-index"]} aria-hidden="true">
        Scroll to explore
      </span>
    </section>
  );
}
