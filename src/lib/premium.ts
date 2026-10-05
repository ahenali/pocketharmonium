import { useCallback, useEffect, useState } from "react";

/**
 * Raag Guide unlock.
 *
 * Visitors unlock the Raag Guide by starring the GitHub repo. We check GitHub's public
 * stargazers list for the username they enter. This is a goodwill check, not security:
 * it runs in the browser and anyone can type a username that has starred the repo.
 */
export const REPO_OWNER = "ahenali";
export const REPO_NAME = "pocketharmonium";
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

const UNLOCK_KEY = "surpeti.raagUnlock";
const STARGAZERS_PER_PAGE = 100;
const MAX_PAGES = 30;

export type StarCheck = "starred" | "not-starred" | "rate-limited" | "error";

async function hasStarred(username: string): Promise<StarCheck> {
  const wanted = username.toLowerCase();
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/stargazers?per_page=${STARGAZERS_PER_PAGE}&page=${page}`,
        { headers: { Accept: "application/vnd.github+json" } },
      );
      if (res.status === 403 || res.status === 429) return "rate-limited";
      if (!res.ok) return "error";
      const stargazers = (await res.json()) as { login: string }[];
      if (stargazers.some((s) => s.login.toLowerCase() === wanted)) return "starred";
      if (stargazers.length < STARGAZERS_PER_PAGE) return "not-starred";
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

  /** Check a GitHub username against the stargazers list and unlock on success. */
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
