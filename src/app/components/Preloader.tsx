"use client";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";

interface PreloaderProps {
    setComplete: (value: boolean) => void;
}

const progressSteps = [0, 12, 25, 37, 50, 62, 75, 87, 100];
const columnCount = 17;

export default function Preloader({ setComplete }: PreloaderProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Progress Step Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex((prev) => {
                if (prev >= progressSteps.length - 1) {
                    clearInterval(interval);
                    return progressSteps.length - 1;
                }
                return prev + 1;
            });
        }, 1200); // Speed of the "jump" between bars
        return () => clearInterval(interval);
    }, [progressSteps.length]);

    const currentProgress = progressSteps[stepIndex];

    // 2. GSAP Animation Sequence
    useEffect(() => {
        if (currentProgress === 100) {
            const tl = gsap.timeline({
                delay: 1.2,
                onComplete: () => setComplete(true),
            });

            // Step A: Expand from 50% to 100% height (Full Screen)
            tl.to(".preloader-column", {
                height: "100vh",
                y: 0,
                duration: 0.6,
                ease: "expo.inOut",
            })
                // Step B: Staggered exit to the top
                .to(".preloader-column", {
                    yPercent: -100,
                    duration: 0.6,
                    ease: "power4.inOut",
                    stagger: {
                        //     amount: 0.5,
                        //     from: "random",
                        // },  stagger: {
                        grid: [1, columnCount],
                        from: "center", // Mimics the middle-out disappearance in your video
                        amount: 0.5,
                    },
                }, "+=0.2") // slight delay after expansion
                .to(containerRef.current, {
                    display: "none",
                    duration: 1.4,
                });
        }
    }, [currentProgress, setComplete, columnCount]);



    return (
        <div ref={containerRef} className="fixed inset-0 z-99 flex flex-col bg-white overflow-hidden">
            {/* Percentage Counter - Centered in viewport */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                <span className="font-mono text-6xl font-bold mix-blend-difference text-white">
                    {currentProgress}%
                </span>
            </div>

            {/* Text Container */}
            <div className="absolute inset-x-0 bottom-1/12 flex items-center justify-center pointer-events-none z-50">
                <span className="font-mono text-6xl font-bold mix-blend-difference text-white capitalize">
                    Engineering isn't just about writing code
                </span>
            </div>


            <div className="absolute inset-0 flex items-end">
                {[...Array(columnCount)].map((_, i) => {
                    const isActive = i === stepIndex;

                    return (
                        <div
                            key={i}
                            className="preloader-column h-1/2 flex-1 bg-[#1a1a1a] transition-all duration-1200"
                            style={{
                                transform: isActive ? "translateY(60px)" : "translateY(0px)",
                            }}
                        />
                    )
                }
                )}
            </div>
        </div>
    );
}