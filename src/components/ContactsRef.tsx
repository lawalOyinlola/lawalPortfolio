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

interface ContactsRefProps {
  scrollTriggerSelector?: string;
  scrollTriggerStart?: string;
  audioTriggerStart?: string;
}

function ContactsRef({
  scrollTriggerSelector,
  scrollTriggerStart,
  audioTriggerStart,
}: ContactsRefProps = {}) {
  const contactRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLSpanElement>(null);
  const title2Ref = useRef<HTMLSpanElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const { prefersReducedMotion, isHydrated: isMotionHydrated } =
    usePrefersReducedMotion();

  const isVisibleRef = useRef(false);
  const isAudioEnabledRef = useRef(true);

  const [ambientAudioEnabled, setAmbientAudioEnabled] = useState(true);


  useEffect(() => {
    const saved = localStorage.getItem("ambientAudioEnabled");
    if (saved !== null) {
      const isEnabled = saved === "true";
      setAmbientAudioEnabled(isEnabled);
      isAudioEnabledRef.current = isEnabled;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ambientAudioEnabled" && e.newValue !== null) {
        const isEnabled = e.newValue === "true";
        if (isAudioEnabledRef.current !== isEnabled) {
          setAmbientAudioEnabled(isEnabled);
          isAudioEnabledRef.current = isEnabled;
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (isAudioEnabledRef.current !== detail) {
        setAmbientAudioEnabled(detail);
        isAudioEnabledRef.current = detail;
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("ambientAudioToggled", handleCustomEvent);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("ambientAudioToggled", handleCustomEvent);
    };
  }, []);

  const toggleAudio = useCallback(() => {
    setAmbientAudioEnabled((prev) => !prev);
  }, []);

  // Sync side-effects (localStorage, event dispatch, and audio context resume)
  useEffect(() => {
    if (!isMotionHydrated) return;

    localStorage.setItem("ambientAudioEnabled", String(ambientAudioEnabled));
    isAudioEnabledRef.current = ambientAudioEnabled;

    window.dispatchEvent(
      new CustomEvent("ambientAudioToggled", { detail: ambientAudioEnabled }),
    );

    // Force resume the context immediately if unmuting
    if (
      ambientAudioEnabled &&
      audioContextRef.current?.state === "suspended"
    ) {
      audioContextRef.current.resume();
    }
  }, [ambientAudioEnabled, isMotionHydrated]);

  const initAudio = useCallback(() => {
    if (prefersReducedMotion) return;

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
    if (!isMotionHydrated) return;

    if (!ambientAudioEnabled || prefersReducedMotion) {
      if (gainNodeRef.current) {
        gsap.to(gainNodeRef.current.gain, {
          value: 0,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      }
    } else {
      if (isVisibleRef.current) {
        // If we switch it on while already watching, ensure audio goes up
        if (gainNodeRef.current) {
          gsap.to(gainNodeRef.current.gain, {
            value: 0.1,
            duration: 1,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        }
      }
    }
  }, [ambientAudioEnabled, prefersReducedMotion, initAudio]);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleGlobalInteraction = () => {
      // Unconditionally resume the context on the first user interaction
      // globally across the app to unlock the Web Audio API proactively.
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
    };

    // Add aggressive, passive listeners on the capture phase so they register
    // even if propagation is stopped somewhere.
    const events = [
      "pointerdown",
      "touchstart",
      "keydown",
      "wheel",
      "scroll",
      "mousemove",
    ];
    events.forEach((e) =>
      document.addEventListener(e, handleGlobalInteraction, {
        capture: true,
        passive: true,
      }),
    );

    return () => {
      events.forEach((e) =>
        document.removeEventListener(e, handleGlobalInteraction, {
          capture: true,
        }),
      );
    };
  }, []);

  useGSAP(
    () => {
      if (!isMotionHydrated) return;
      initAudio();

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
              start: scrollTriggerStart || "top 20%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Use a dedicated ScrollTrigger for the audio to control timing correctly
        const audioTrigger = ScrollTrigger.create({
          trigger: scrollTriggerSelector || contactRef.current,
          start: audioTriggerStart || "top 80%", // Trigger just before text reveal by default
          end: audioTriggerStart ? "88% top" : "bottom 0%",
          onToggle: (self) => {
            isVisibleRef.current = self.isActive;

            // Short circuit if user disabled manually (read from ref to avoid stale closure)
            if (!isAudioEnabledRef.current || prefersReducedMotion) return;

            if (self.isActive) {
              if (audioContextRef.current?.state === "suspended") {
                audioContextRef.current.resume().catch(() => {});

                // If the browser STILL blocked it because of missing user interaction,
                // animate the speaker icon to gently prompt the user to interact.
                setTimeout(() => {
                  if (
                    audioContextRef.current?.state === "suspended" &&
                    buttonRef.current &&
                    isAudioEnabledRef.current
                  ) {
                    gsap.to(buttonRef.current, {
                      scale: 1.15,
                      yoyo: true,
                      repeat: 5,
                      duration: 0.3,
                      ease: "power2.inOut",
                    });
                  }
                }, 150);
              }
              if (gainNodeRef.current) {
                gsap.to(gainNodeRef.current.gain, {
                  value: 0.1,
                  duration: 1.2,
                  ease: "power2.inOut",
                  overwrite: "auto",
                });
              }
            } else {
              if (gainNodeRef.current) {
                gsap.to(gainNodeRef.current.gain, {
                  value: 0,
                  duration: 0.8,
                  ease: "power2.out",
                  overwrite: "auto",
                });
              }
            }
          },
        });

        return () => {
          split1?.revert();
          split2?.revert();
          audioTrigger.kill();
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
          gsap.killTweensOf(buttonRef.current);
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
          <Button
            ref={buttonRef}
            variant="ghost"
            size="icon"
            disabled={prefersReducedMotion}
            onClick={toggleAudio}
            className="rounded-full"
            title={
              prefersReducedMotion
                ? "Ambient audio unavailable while reduced motion is enabled"
                : !isMotionHydrated || ambientAudioEnabled
                  ? "Mute audio"
                  : "Unmute audio"
            }
            aria-label={
              prefersReducedMotion
                ? "Ambient audio unavailable while reduced motion is enabled"
                : !isMotionHydrated || ambientAudioEnabled
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
