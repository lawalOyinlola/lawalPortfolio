"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import ContactButtons from "./ui/ContactButtons";
import { Button } from "./ui/button";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

function ContactsRef() {
  const contactRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const [ambientAudioEnabled, setAmbientAudioEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("ambientAudioEnabled");
    return saved !== null ? saved === "true" : true;
  });

  const initAudio = useCallback(() => {
    if (prefersReducedMotion || !ambientAudioEnabled) return;

    // If context exists and is running/suspended, we're good. If it's closed, we need a new one.
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

  // Persist preference
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
      // If we're enabling audio and the section is active, start playing
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
  }, []);

  useGSAP(
    () => {
      initAudio();

      const chars = gsap.utils.toArray<HTMLElement>(".contact-char");
      if (chars.length > 0) {
        gsap.fromTo(
          chars,
          { opacity: 0.4, scaleX: -1 },
          {
            opacity: 1,
            scaleX: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "expo.inOut",
            scrollTrigger: {
              trigger: contactRef.current,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          },
        );
      }

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
          // If we are scrolling very fast and somehow leave the range, double check gain
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
          <h2 className="contact-title flex flex-col items-start">
            <span className="inline-flex bg-background px-2 py-1">
              {"LET'S  EXECUTE".split("").map((char, charIdx) => (
                <span
                  key={charIdx}
                  className={
                    char === " "
                      ? "w-3 inline-block"
                      : "contact-char inline-block origin-center opacity-0"
                  }
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
            <span className="inline-flex bg-background px-2 py-1">
              {"YOUR  NEXT PROJECT".split("").map((char, charIdx) => (
                <span
                  key={charIdx}
                  className={
                    char === " "
                      ? "w-3 inline-block"
                      : "contact-char inline-block origin-center opacity-0"
                  }
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          </h2>
        </div>

        <div className="mt-auto w-full flex justify-between items-end pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAmbientAudioEnabled(!ambientAudioEnabled)}
            className="rounded-full bg-background/5 border border-background/10 text-background/40 hover:text-background/90"
            title={ambientAudioEnabled ? "Mute audio" : "Unmute audio"}
            aria-label={
              ambientAudioEnabled
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
