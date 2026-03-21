import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { BRAND } from "@/app/constants/brand"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const handleEmailClick = (
  e?: React.MouseEvent<HTMLElement>
) => {
  if (e) e.preventDefault();
  const subject = encodeURIComponent("Inquiry from Portfolio Website");
  const body = encodeURIComponent(
    "Hi there,\n\nI am reaching out to you from your portfolio website concerning..."
  );
  window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
};
