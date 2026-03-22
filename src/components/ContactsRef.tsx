"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ContactButtons from "./ui/ContactButtons";
import { Button } from "./ui/button";
import { handleEmailClick } from "@/lib/utils";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP, SplitText);
}

function ContactsRef() {
  const contactRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [ambientAudioEnabled, setAmbientAudioEnabled] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ambientAudioEnabled");
    if (saved !== null) {
      setAmbientAudioEnabled(saved === "true");
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("ambientAudioEnabled", String(ambientAudioEnabled));
    }
  }, [ambientAudioEnabled, isHydrated]);

  const initAudio = useCallback(() => {
    if (prefersReducedMotion || !ambientAudioEnabled) return;

    if (audioContextRef.current && audioContextRef.current.state !== "closed")
      return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    // Create white noise buffer
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    // Create a low-pass filter to make it sound more like "shhhhhh" and less harsh
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.5;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // Start muted
    gainNodeRef.current = gainNode;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    sourceRef.current = source;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  }, [prefersReducedMotion, ambientAudioEnabled]);

  useEffect(() => {
    localStorage.setItem("ambientAudioEnabled", String(ambientAudioEnabled));

    if (!ambientAudioEnabled || prefersReducedMotion) {
      if (gainNodeRef.current) {
        gsap.to(gainNodeRef.current.gain, {
          value: 0,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    } else {
      const trigger = ScrollTrigger.getById("contact-audio-trigger");
      if (trigger?.isActive) {
        initAudio();
        if (gainNodeRef.current) {
          gsap.to(gainNodeRef.current.gain, {
            value: 0.1,
            duration: 1,
            ease: "power2.inOut",
          });
        }
      }
    }
  }, [ambientAudioEnabled, prefersReducedMotion, initAudio]);

  useEffect(() => {
    const handleGlobalInteraction = () => {
      if (
        !prefersReducedMotion &&
        ambientAudioEnabled &&
        audioContextRef.current?.state === "suspended"
      ) {
        audioContextRef.current.resume();
      }
    };
    window.addEventListener("touchstart", handleGlobalInteraction);
    window.addEventListener("mousedown", handleGlobalInteraction);
    return () => {
      window.removeEventListener("touchstart", handleGlobalInteraction);
      window.removeEventListener("mousedown", handleGlobalInteraction);
    };
  }, [prefersReducedMotion, ambientAudioEnabled]);

  useGSAP(
    () => {
      initAudio();

      if (title1Ref.current && title2Ref.current) {
        const split1 = new SplitText(title1Ref.current, {
          type: "words,chars",
          charsClass: "contact-char inline-block origin-center opacity-0",
        });
        const split2 = new SplitText(title2Ref.current, {
          type: "words,chars",
          charsClass: "contact-char inline-block origin-center opacity-0",
        });

        const allChars = [...split1.chars, ...split2.chars];

        gsap.fromTo(
          allChars,
          { opacity: 0.4, scaleX: -1 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "expo.inOut",
            scrollTrigger: {
              trigger: contactRef.current,
              start: "top center",
              toggleActions: "play none none reverse",
            },
          },
        );

        ScrollTrigger.create({
          id: "contact-audio-trigger",
          trigger: contactRef.current,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive && !prefersReducedMotion && ambientAudioEnabled) {
              if (audioContextRef.current?.state === "suspended") {
                audioContextRef.current.resume();
              }
              if (gainNodeRef.current) {
                gsap.to(gainNodeRef.current.gain, {
                  value: 0.1,
                  duration: 1.2,
                  ease: "power2.inOut",
                });
              }
            } else {
              if (gainNodeRef.current) {
                gsap.to(gainNodeRef.current.gain, {
                  value: 0,
                  duration: 0.8,
                  ease: "power2.out",
                });
              }
            }
          },
          onUpdate: (self) => {
            if (
              !self.isActive &&
              gainNodeRef.current &&
              gainNodeRef.current.gain.value > 0
            ) {
              gsap.set(gainNodeRef.current.gain, { value: 0 });
            }
          },
        });

        return () => {
          split1.revert();
          split2.revert();
          if (sourceRef.current) {
            try {
              sourceRef.current.stop();
            } catch {
              // Ignore - source may already be stopped
            }
            sourceRef.current.disconnect();
            sourceRef.current = null;
          }
          if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
          }
          gainNodeRef.current = null;
        };
      }
    },
    { scope: contactRef },
  );

  return (
    <div
      ref={contactRef}
      className="sticky top-0 h-screen bg-background flex-center"
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAmbientAudioEnabled(!ambientAudioEnabled)}
            className="rounded-full"
            title={!isHydrated || ambientAudioEnabled ? "Mute audio" : "Unmute audio"}
            aria-label={
              !isHydrated || ambientAudioEnabled
                ? "Mute ambient audio"
                : "Unmute ambient audio"
            }
          >
            {ambientAudioEnabled && !prefersReducedMotion ? (
              <SpeakerHighIcon weight="bold" />
            ) : (
              <SpeakerSlashIcon weight="bold" />
            )}
          </Button>
          <ContactButtons />
        </div>
      </div>
    </div>
  );
}

export default ContactsRef;
