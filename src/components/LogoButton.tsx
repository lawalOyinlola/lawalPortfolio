"use client";
import gsap from "gsap";
import { useGSAP } from '@gsap/react'; ``
import { BRAND } from "@/app/constants/brand";
import { Button } from "./ui/button";
import Image from "next/image";

const brandName = BRAND.shortName;

const LogoButton = () => {
    useGSAP(() => {
        gsap.to(".char", {
            scaleX: -1,
            ease: "expo.inOut",
            duration: 1.6,
            stagger: { amount: 0.8, from: "start" },
            delay: 1,
        })
    });


    return (
        <Button variant="outline" size="lg" className="text-lg gap-2.5">
            <Image src="/icons/menuLogo.svg" alt="Menu Icon" width={20} height={20} />
            <p aria-label="My brand logo - Lawal, written backwards" className="text-base font-semibold">
                {brandName.split("").map((char, i) => (
                    <span key={i} className="char inline-block">{char}</span>
                ))}
            </p>
        </Button>

    )

}

export default LogoButton;


