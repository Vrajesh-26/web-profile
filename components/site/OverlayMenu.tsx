"use client";

import { useEffect, useRef, useState } from "react";
import type { MenuRoomSeed } from "@/lib/data";
import styles from "./OverlayMenu.module.css";

type OverlayMenuProps = {
  rooms: readonly MenuRoomSeed[];
  onClose: () => void;
};

export function OverlayMenu({ rooms, onClose }: OverlayMenuProps) {
  const [activeRoom, setActiveRoom] = useState(0);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>(
      `.${styles["overlay-menu-link"]}`,
    );
    firstLink?.focus();
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <nav
      ref={menuRef}
      id="site-menu"
      className={styles["overlay-menu"]}
      aria-label="Main navigation"
      onKeyDown={handleKeyDown}
    >
      <div className={styles["overlay-menu-inner"]}>
        <div className={styles["overlay-menu-list"]}>
          {rooms.map((room, index) => (
            <a
              key={room.label}
              className={`${styles["overlay-menu-link"]}${activeRoom === index ? ` ${styles["is-active"]}` : ""}`}
              href={room.href}
              onFocus={() => setActiveRoom(index)}
              onMouseEnter={() => setActiveRoom(index)}
              onClick={onClose}
              style={{ animationDelay: `${index * 45}ms` }}
            >
              {room.label}
            </a>
          ))}
        </div>
        <aside
          className={styles["overlay-menu-note"]}
          data-accent={rooms[activeRoom]?.accent ?? "moss"}
          aria-live="polite"
        >
          <span className={styles["menu-color-swatch"]} aria-hidden="true" />
          <p>{rooms[activeRoom]?.description}</p>
        </aside>
      </div>
      <button className={styles["overlay-menu-close"]} type="button" onClick={onClose}>
        Close <span aria-hidden="true">×</span>
      </button>
    </nav>
  );
}
