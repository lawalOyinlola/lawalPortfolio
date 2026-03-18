"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowUpRightIcon,
  GithubLogoIcon,
  ListIcon,
  XIcon,
} from "@phosphor-icons/react";
import { scrollToAnchor } from "@/lib/navigation";
import LogoButton from "./LogoButton";
import { Button, buttonVariants } from "./ui/button";
import { MenuOverlay } from "./MenuOverlay";
import { ProjectModal } from "./ProjectModal";
import Magnetic from "./ui/Magnetic";
import { HoverPushText } from "./ui/hover-push-text";
import { BRAND } from "../app/constants/brand";
import { PROJECTS } from "../app/constants/projects";

interface NavbarProps {
  ready?: boolean;
}

const Navbar = ({ ready = true }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const pathname = usePathname();

  const isProjectPage = pathname?.startsWith("/projects/");
  const projectSlug = pathname?.split("/projects/")[1];
  const currentProject = isProjectPage
    ? PROJECTS.find((p) => p.slug === projectSlug)
    : null;

  return (
    <div>
      {/* Logo Button */}
      {ready && (
        <div className="logo-btn fixed top-4.5 left-4.5 z-20 transition-opacity duration-200 shadow-sm">
          <Magnetic>
            <LogoButton ready />
          </Magnetic>
        </div>
      )}

      {/* Minimal Nav at bottom of the page */}

      {ready && (
        <div className="app-mini-nav fixed bottom-0 inset-x-0 w-full p-4.5 py-3 flex justify-between items-center z-20 transition-opacity duration-200">
          <MenuOverlay
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />
          <ProjectModal
            isOpen={isProjectOpen}
            onClose={() => setIsProjectOpen(false)}
          />
          <div className="max-w-30 xl:max-w-70 w-full">
            <Magnetic
              className={`relative ${!isProjectOpen ? "z-30" : "z-20"}`}
            >
              <Button
                variant="outline"
                size="icon-lg"
                className="relative px-1!"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setIsMenuOpen((prev) => !prev)}
              >
                <XIcon
                  weight="bold"
                  className={`absolute transition-all duration-300 ease-in-out ${
                    isMenuOpen
                      ? "rotate-0 scale-100 opacity-100"
                      : "-rotate-90 scale-50 opacity-0 delay-800"
                  }`}
                />
                <ListIcon
                  weight="bold"
                  className={`absolute transition-all duration-300 ease-in-out ${
                    isMenuOpen
                      ? "rotate-90 scale-50 opacity-0"
                      : "rotate-0 scale-100 opacity-100 delay-800"
                  }`}
                />
              </Button>
            </Magnetic>
          </div>

          {isProjectPage && !isMenuOpen && !isProjectOpen && (
            <div className="hidden min-[928px]:flex items-center gap-1 bg-background border-2 border-background z-21 shadow-sm *:not-first:border *:not-first:border-border *:not-first:px-3.75 *:not-first:hover:border-primary">
              {currentProject?.github && (
                <a
                  href={currentProject.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open project source code on GitHub"
                  className={buttonVariants({
                    size: "icon-lg",
                  })}
                >
                  <GithubLogoIcon />
                </a>
              )}
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => scrollToAnchor("introduction")}
              >
                <HoverPushText>Introduction</HoverPushText>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => scrollToAnchor("key-points")}
              >
                <HoverPushText>4 points</HoverPushText>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => scrollToAnchor("deeper-details")}
              >
                <HoverPushText>Deeper Details</HoverPushText>
              </Button>
              {currentProject?.live && (
                <a
                  href={currentProject.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({
                    size: "lg",
                    className: "w-30",
                  })}
                >
                  <HoverPushText>Visit site</HoverPushText>
                  <ArrowUpRightIcon className="group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>
          )}

          {/* CTA Bttons */}
          <div className="flex justify-end max-w-70 w-full">
            <div className="flex-center justify-end gap-1 bg-background border-2 border-background shadow-sm">
              <a
                href={BRAND.url}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: `w-32 ${!isMenuOpen && !isProjectOpen ? "z-21" : ""}`,
                })}
              >
                <HoverPushText>View Resume</HoverPushText>
              </a>

              <Magnetic
                strength={isProjectOpen ? 0 : 0.5}
                className={!isMenuOpen ? "z-30" : "z-20"}
              >
                <Button
                  onClick={() => setIsProjectOpen((prev) => !prev)}
                  size="lg"
                  className="w-32"
                  variant={isProjectOpen ? "outline" : "default"}
                >
                  <XIcon
                    weight="bold"
                    className={`absolute transition-all duration-300 ease-in-out ${
                      isProjectOpen
                        ? "rotate-0 scale-100 opacity-100"
                        : "-rotate-90 scale-50 opacity-0 delay-800"
                    }`}
                  />
                  <span
                    className={`absolute transition-all duration-300 ease-in-out ${
                      isProjectOpen
                        ? "scale-40 opacity-0"
                        : "scale-100 opacity-100 delay-800"
                    }`}
                  >
                    <HoverPushText>Got a Project?</HoverPushText>
                  </span>
                </Button>
              </Magnetic>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
