"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuRoomSeed } from "@/lib/data";
import { OverlayMenu } from "@/components/site/OverlayMenu";
import styles from "./SiteHeader.module.css";

type SiteHeaderProps = {
  menuRooms: readonly MenuRoomSeed[];
  wordmark: string;
};

export function SiteHeader({ menuRooms, wordmark }: SiteHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  return (
    <>
      <header className={styles["site-header"]}>
        <a className={styles["site-wordmark"]} href="#home" aria-label={wordmark}>
          {wordmark}
        </a>
        <button
          ref={menuButtonRef}
          className={styles["menu-button"]}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="site-menu"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span>{isMenuOpen ? "Close" : "Menu"}</span>
          <span className={styles["menu-button-mark"]} aria-hidden="true">
            {isMenuOpen ? "−" : "+"}
          </span>
        </button>
      </header>
      {isMenuOpen && <OverlayMenu rooms={menuRooms} onClose={closeMenu} />}
    </>
  );
}
