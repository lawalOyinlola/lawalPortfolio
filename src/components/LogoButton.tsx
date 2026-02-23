"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BRAND_LETTERS } from "@/app/constants";
import { Button } from "./ui/button";

interface LogoButtonProps {
  ready?: boolean;
}

const LogoButton = ({ ready = true }: LogoButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    >
      <Image src="/icons/menuLogo.svg" alt="Menu Icon" width={20} height={20} />
      <p
        aria-label="My brand logo - Lawal, written backwards"
        className="text-base font-semibold"
      >
        {BRAND_LETTERS.map((char, i) => (
          <span key={i} className="char inline-block">
            {char}
          </span>
        ))}
      </p>
    </Button>
  );
};

export default LogoButton;
