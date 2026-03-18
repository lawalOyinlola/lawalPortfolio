"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { BRAND_LETTERS } from "@/app/constants";
import { buttonVariants } from "./ui/button";
import { HoverFlipText } from "./ui/hover-flip-text";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollToPlugin);
}

interface LogoButtonProps {
  ready?: boolean;
}

const LogoButton = ({ ready = true }: LogoButtonProps) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === "/") {
      gsap.to(window, {
        scrollTo: { y: 0, autoKill: true },
        duration: 2,
        ease: "power3.out",
      });
    } else {
      router.push("/");
    }
  };

  useGSAP(
    () => {
      if (!ready) return;
      gsap.to(".char", {
        scaleX: -1,
        ease: "expo.inOut",
        duration: 1.6,
        stagger: { amount: 0.8, from: "start" },
        delay: 1.4,
      });
    },
    { scope: buttonRef, dependencies: [ready] },
  );

  return (
    <a
      ref={buttonRef}
      href="/"
      aria-label={pathname === "/" ? "Scroll to top" : "Go to home"}
      onClick={handleLogoClick}
      className={buttonVariants({
        variant: "outline",
        size: "lg",
        className: "text-lg gap-2.5 cursor-pointer",
      })}
    >
      <Image src="/icons/menuLogo.svg" alt="Logo Icon" width={20} height={20} />
      <span
        aria-label="My brand logo - Lawal, written backwards"
        className="text-base font-semibold"
      >
        <HoverFlipText text={BRAND_LETTERS} charClassName="char" />
      </span>
    </a>
  );
};

export default LogoButton;
