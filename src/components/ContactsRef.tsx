"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ContactButtons from "./ui/ContactButtons";
import { handleEmailClick } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);
}

interface ContactsRefProps {
  scrollTriggerSelector?: string;
  scrollTriggerStart?: string;
}

function ContactsRef({
  scrollTriggerSelector,
  scrollTriggerStart,
}: ContactsRefProps = {}) {
  const contactRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const { prefersReducedMotion, isHydrated: isMotionHydrated } =
    usePrefersReducedMotion();

  useGSAP(
    () => {
      if (!isMotionHydrated) return;

      if (title1Ref.current && title2Ref.current) {
        let split1: SplitText | null = null;
        let split2: SplitText | null = null;
        let allChars: (Element | null)[] = [];

        if (!prefersReducedMotion) {
          split1 = new SplitText(title1Ref.current, {
            type: "words,chars",
            charsClass: "contact-char inline-block origin-center opacity-0",
          });
          split2 = new SplitText(title2Ref.current, {
            type: "words,chars",
            charsClass: "contact-char inline-block origin-center opacity-0",
          });

          allChars = [...split1.chars, ...split2.chars];

          gsap.set(allChars, { opacity: 0.4, scaleX: -1 });

          gsap.to(allChars, {
            opacity: 1,
            scaleX: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "expo.out",
            scrollTrigger: {
              trigger: scrollTriggerSelector || contactRef.current,
              start: scrollTriggerStart || "top 40%",
              toggleActions: "play none none reverse",
            },
          });
        }

        return () => {
          split1?.revert();
          split2?.revert();
        };
      }
    },
    {
      scope: contactRef,
      dependencies: [isMotionHydrated, prefersReducedMotion],
    },
  );

  return (
    <div
      ref={contactRef}
      className="relative w-full h-full bg-background flex-center"
    >
      <div className="wrapper max-w-screen w-full min-h-screen pt-4.5 flex flex-col gap-19">
        <div className="relative mt-2 grow w-full flex justify-end items-end overflow-hidden tv-static">
          <div className="tv-static-overlay" />
          <h2 className="contact-title leading-none">
            <button
              type="button"
              onClick={handleEmailClick}
              aria-label="Send us an email"
              className="flex flex-col items-start text-left focus-visible:outline-offset-4"
            >
              <span
                ref={title1Ref}
                className="inline bg-background px-2 py-1 box-decoration-clone leading-tight md:leading-snug"
              >
                LET&apos;S &nbsp;EXECUTE
              </span>
              <span
                ref={title2Ref}
                className="inline bg-background px-2 py-1 box-decoration-clone leading-tight md:leading-snug"
              >
                YOUR &nbsp;NEXT &nbsp;PROJECT
              </span>
            </button>
          </h2>
        </div>

        <div className="mt-auto w-full flex justify-between items-end pb-4">
          <div className="flex-1" />
          <ContactButtons />
        </div>
      </div>
    </div>
  );
}

export default ContactsRef;
