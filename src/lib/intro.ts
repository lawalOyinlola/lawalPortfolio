// Whether the full preloader intro plays on this load. The full intro plays
// once per tab session; later hard loads just lift the columns.
//
// The decision is made by INTRO_SCRIPT, inline in <head>, before first paint:
// the server can't read sessionStorage, so without it the server-rendered
// line (and its caret) would flash on screen before hydration hid it.

const SEEN_KEY = "introSeen";

export const INTRO_SCRIPT = `try{document.documentElement.dataset.intro=sessionStorage.getItem("${SEEN_KEY}")==="1"?"skip":"play"}catch(e){document.documentElement.dataset.intro="play"}`;

export function shouldPlayIntro() {
  return document.documentElement.dataset.intro !== "skip";
}

export function markIntroSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage unavailable: the intro just plays again next load.
  }
}

/** Once the overlay is gone, so the CSS that hides the line can't cut its fade short. */
export function markIntroDone() {
  document.documentElement.dataset.intro = "skip";
}
