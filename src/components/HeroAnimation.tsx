"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

// Register ScrollTrigger for Next.js SSR compatibility
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const COLUMN_COUNT = 16;

const HeroAnimation = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Initial State: All shutters up (revealing the dark background)
        gsap.set(".hero-shutter", { yPercent: 0 });


        const tl = gsap.timeline({
            repeat: -1,
            yoyo: true,
            defaults: { ease: "power2.inOut", duration: 1.5 }
        });
        // Create a wave pattern or random shutter movement
        tl.to(".hero-shutter", {
            yPercent: (i) => -25 - Math.random() * 50, // Randomized shutter depth
            stagger: {
                each: 0.1,
                from: "random"
            }
        })
            .to(".hero-shutter", {
                yPercent: (i) => -17 - Math.random() * 34,
                stagger: {
                    each: 0.05,
                    from: "center"
                }
            });
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="flex h-2/3 w-full Z-999">
            {[...Array(COLUMN_COUNT)].map((_, i) => (
                <div
                    key={i}
                    className="relative h-full flex-1 overflow-hidden"
                >
                    {/* This represents the "pixelated" shutter moving over the background */}
                    <div
                        className={`hero-shutter shutter-col-${i} absolute inset-0 bg-foreground`}
                    />
                </div>
            ))}
        </div>
    );
};


export default HeroAnimation;