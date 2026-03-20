"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { BRAND_LETTERS } from "@/app/constants";
import { buttonVariants } from "./ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollToPlugin);
}

interface LogoButtonProps {
  ready?: boolean;
}

const LogoButton = ({ ready = true }: LogoButtonProps) => {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const isModifiedClick =
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

    if (pathname === "/" && !isModifiedClick) {
      e.preventDefault();
      if (pathname === "/") {
        gsap.to(window, {
          scrollTo: { y: 0, autoKill: true },
          duration: 2,
          ease: "power3.out",
        });
      }
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
    <Link
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
      <span aria-hidden="true" className="text-base font-semibold">
        {BRAND_LETTERS.map((char, i) => (
          <span key={i} className="char inline-block">
            {char}
          </span>
        ))}
      </span>
    </Link>
  );
};

export default LogoButton;
