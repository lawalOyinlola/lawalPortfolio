"use client";

import { useState } from "react";
import { ListIcon, XIcon } from "@phosphor-icons/react";
import LogoButton from "./LogoButton";
import { Button, buttonVariants } from "./ui/button";
import { MenuOverlay } from "./MenuOverlay";
import { ProjectModal } from "./ProjectModal";
import { BRAND } from "../app/constants/brand";

interface NavbarProps {
  ready?: boolean;
}

const Navbar = ({ ready = true }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  return (
    <div>
      {/* Logo Button */}
      {ready && (
        <div className="logo-btn fixed top-4.5 left-4.5 z-20 transition-opacity duration-200">
          <LogoButton ready />
        </div>
      )}

      {/* Minimal Nav at bottom of the page */}

      {ready && (
        <div className="app-mini-nav fixed bottom-0 inset-x-0 w-full p-4.5 flex justify-between items-center gap-2 *:not-first:px-6 z-20 transition-opacity duration-200">
          <MenuOverlay
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
          />
          <ProjectModal
            isOpen={isProjectOpen}
            onClose={() => setIsProjectOpen(false)}
          />
          <Button
            variant="outline"
            size="icon-lg"
            className={`mr-auto! relative px-1! ${!isProjectOpen ? "z-21" : "z-20"}`}
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

          <a
            href={BRAND.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: `w-34 ${!isMenuOpen && !isProjectOpen ? "z-21" : ""}`,
            })}
          >
            View Resume
          </a>

          <Button
            onClick={() => setIsProjectOpen((prev) => !prev)}
            size="lg"
            className={`w-34 ${!isMenuOpen ? "z-21" : ""}`}
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
              Got a Project?
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
