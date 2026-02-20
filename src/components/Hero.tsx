"use client";
import HeroAnimation from "./HeroAnimation";
import { BRAND } from "@/app/constants/brand";

const Hero = () => {
    return (
        <section className="relative h-screen w-full flex flex-col justify-end items-center py-20 overflow-hidden">
            {/* Background Animation Layer */}
            <div className="absolute inset-0 z-2">
                <HeroAnimation />
            </div>

            {/* Hero Content */}
            <div className="max-w-206 z-10">
                <h1 className="header text-primary ">
                    Engineering isn’t just about writing code — it’s about building systems people can depend on.
                    <span className="text-accent font-normal">
                        {" "}{BRAND.shortName} represents a commitment to precision, performance, and reliability. Every line of code is written with the intent to make technology feel effortless —
                    </span>
                    {" "}stable under pressure, scalable by design, and secure by default.
                </h1>
            </div>
        </section>
    );
};

export default Hero;