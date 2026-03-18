type RouterLike = {
  push: (href: string) => void;
};
/**
 * Scrolls the page to the element with the specified ID.
 */
export const scrollToAnchor = (
  id: string,
  behavior: ScrollBehavior = "smooth",
) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior });
  }
};

/**
 * Smart navigation: handles same-page vs cross-page anchor scrolling.
 */
export const handleNavigation = (
  href: string,
  anchor: string | undefined,
  currentPathname: string,
  router: RouterLike,
  onComplete?: () => void,
) => {
  if (onComplete) onComplete();

  if (!anchor) {
    router.push(href);
    return;
  }

  if (currentPathname === href) {
    // Already on the target page — smooth scroll immediately
    requestAnimationFrame(() => {
      scrollToAnchor(anchor);
    });
  } else {
    // Navigate to new page without hash, passing anchor through session storage
    try {
      sessionStorage.setItem("pendingAnchor", anchor);
    } catch {
      // Storage unavailable; navigate with hash instead
      return router.push(`${href}#${anchor}`);
    }
    router.push(href);
  }
};
