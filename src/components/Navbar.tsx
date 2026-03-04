"use client";

import { ListIcon } from "@phosphor-icons/react";
import LogoButton from "./LogoButton";
import { Button } from "./ui/button";

interface NavbarProps {
  ready?: boolean;
}

const Navbar = ({ ready = true }: NavbarProps) => {
  return (
    <div>
      {/* Logo Button */}
      <div
        className={`logo-btn fixed top-4.5 left-4.5 z-20 transition-opacity duration-200 ${
          ready ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <LogoButton ready={ready} />
      </div>

      {/* Minimal Nav at bottom of the page */}
      <div
        className={`app-mini-nav fixed bottom-0 inset-x-0 w-full p-4.5 flex justify-between items-center gap-2 *:not-first:px-6 z-20 transition-opacity duration-200 ${
          ready ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <Button
          variant="outline"
          size="icon-lg"
          className="mr-auto!"
          aria-label="Open menu"
        >
          <ListIcon weight="bold" />
        </Button>

        <Button variant="outline" size="lg">
          Contact Me
        </Button>

        <Button size="lg">Got a Project?</Button>
      </div>
    </div>
  );
};

export default Navbar;
