"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { BRAND_LETTERS } from "@/app/constants";
import { Button } from "./ui/button";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollToPlugin);
}

interface LogoButtonProps {
  ready?: boolean;
}

const LogoButton = ({ ready = true }: LogoButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollToTop = () => {
    gsap.to(window, {
      scrollTo: { y: 0, autoKill: true },
      duration: 2,
      ease: "power3.out",
    });
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
    <Button
      ref={buttonRef}
      variant="outline"
      size="lg"
      className="text-lg gap-2.5"
      aria-label="Scroll to top"
      onClick={() => scrollToTop()}
    >
      <Image src="/icons/menuLogo.svg" alt="Logo Icon" width={20} height={20} />
      <span
        aria-label="My brand logo - Lawal, written backwards"
        className="text-base font-semibold"
      >
        {BRAND_LETTERS.map((char, i) => (
          <span key={i} className="char inline-block">
            {char}
          </span>
        ))}
      </span>
    </Button>
  );
};

export default LogoButton;
