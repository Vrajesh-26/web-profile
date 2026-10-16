"use client";

import { useCallback, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import type { ProjectSeed, SkillSeed } from "@/lib/data";
import { ProjectsRoom } from "@/components/rooms/ProjectsRoom/ProjectsRoom";
import { SkillsRoom } from "@/components/rooms/SkillsRoom/SkillsRoom";

const FILTER_CHANGE_EVENT = "portfolio-skill-filter-change";

export function WorkRooms({
  skills,
  projects,
}: {
  skills: readonly SkillSeed[];
  projects: readonly ProjectSeed[];
}) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("popstate", onChange);
    window.addEventListener(FILTER_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener(FILTER_CHANGE_EVENT, onChange);
    };
  }, []);
  const getSnapshot = useCallback(() => {
    const selected = new URLSearchParams(window.location.search).get("skill");
    return selected && skills.some((skill) => skill.name === selected)
      ? selected
      : null;
  }, [skills]);
  const selectedSkill = useSyncExternalStore(subscribe, getSnapshot, () => null);

  function selectSkill(skill: string | null) {
    const applySelection = () => {
      const url = new URL(window.location.href);
      if (skill) {
        url.searchParams.set("skill", skill);
      } else {
        url.searchParams.delete("skill");
      }
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new Event(FILTER_CHANGE_EVENT));
    };
    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };

    if (transitionDocument.startViewTransition) {
      transitionDocument.startViewTransition(() => flushSync(applySelection));
    } else {
      applySelection();
    }
  }

  return (
    <>
      <SkillsRoom
        skills={skills}
        selectedSkill={selectedSkill}
        onSkillSelect={selectSkill}
      />
      <ProjectsRoom projects={projects} selectedSkill={selectedSkill} />
    </>
  );
}
