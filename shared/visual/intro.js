// SPDX-License-Identifier: AGPL-3.0-only
const seenKey = "eudila-intro-seen";

function claimInitialVisit() {
  try {
    if (sessionStorage.getItem(seenKey)) return false;
    sessionStorage.setItem(seenKey, "1");
    return true;
  } catch {
    // Static is the default if session storage is unavailable.
    return false;
  }
}

/** A direct visit to any other route consumes the session's entrance too. */
export function markBrandVisited() {
  claimInitialVisit();
}

/** Optional flourish on an already visible symbol. Never controls content/focus. */
export function playBrandIntro(element) {
  const firstVisit = claimInitialVisit();
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  if (!firstVisit || !element?.animate || media.matches || document.hidden)
    return () => {};

  let animation;
  try {
    animation = element.animate(
      [
        { opacity: 0.6, transform: "scale(.94)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 600, easing: "cubic-bezier(.32, .72, 0, 1)" },
    );
  } catch {
    return () => {};
  }
  const listeners = new AbortController();
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    listeners.abort();
    animation.cancel();
  };
  document.addEventListener("pointerdown", finish, {
    capture: true,
    signal: listeners.signal,
  });
  window.addEventListener("keydown", finish, {
    capture: true,
    signal: listeners.signal,
  });
  window.addEventListener("popstate", finish, { signal: listeners.signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) finish();
    },
    { signal: listeners.signal },
  );
  media.addEventListener(
    "change",
    () => {
      if (media.matches) finish();
    },
    { signal: listeners.signal },
  );
  animation.finished.then(finish, finish);
  return finish;
}
