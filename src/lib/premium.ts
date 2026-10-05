import { useCallback, useEffect, useState } from "react";

/**
 * Raag Guide unlock.
 *
 * Visitors unlock the Raag Guide by starring the GitHub repo. We look through the public
 * "starred repositories" list of the username they enter (newest stars first). This is a
 * goodwill check, not security: it runs in the browser and anyone can type a username that
 * has starred the repo.
 */
export const REPO_OWNER = "ahenali";
export const REPO_NAME = "pocketharmonium";
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

const UNLOCK_KEY = "surpeti.raagUnlock";
const REPOS_PER_PAGE = 100;
const MAX_PAGES = 10;

export type StarCheck = "starred" | "not-starred" | "rate-limited" | "error";

async function hasStarred(username: string): Promise<StarCheck> {
  const target = `${REPO_OWNER}/${REPO_NAME}`.toLowerCase();
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/starred?sort=created&direction=desc&per_page=${REPOS_PER_PAGE}&page=${page}`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (res.status === 404) return "not-starred";
      if (res.status === 403 || res.status === 429) return "rate-limited";
      if (!res.ok) return "error";
      const starred = (await res.json()) as { full_name: string }[];
      if (starred.some((r) => r.full_name.toLowerCase() === target)) return "starred";
      if (starred.length < REPOS_PER_PAGE) return "not-starred";
    }
    return "not-starred";
  } catch {
    return "error";
  }
}

export function usePremium() {
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    try {
      setPremium(Boolean(localStorage.getItem(UNLOCK_KEY)));
    } catch {
      /* storage unavailable */
    }
  }, []);

  /** Check a GitHub username against their starred repositories and unlock on success. */
  const verifyStar = useCallback(async (rawUsername: string): Promise<StarCheck> => {
    const username = rawUsername.trim().replace(/^@/, "");
    if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(username)) return "not-starred";
    const result = await hasStarred(username);
    if (result === "starred") {
      try {
        localStorage.setItem(UNLOCK_KEY, username);
      } catch {
        /* unlock still applies for this session */
      }
      setPremium(true);
    }
    return result;
  }, []);

  return { premium, verifyStar };
}
