"use client";
import { useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import { ComponentExample } from "@/components/component-example";
import Projects from "@/components/Projects";
import LogoButton from "@/components/LogoButton";
import { Button } from "@/components/ui/button";
import { ListIcon } from "@phosphor-icons/react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div className={`transition-opacity duration-1000 ${loading ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        <div className="fixed top-4.5 left-4.5 z-99 ">
          <LogoButton />
        </div>

        <Hero />
        <ComponentExample />
        <Projects />

        {/* Minimal Nav at bottom of the page */}
        <div className="fixed inset-x-0 bottom-0 p-4.5 flex justify-between items-center z-999">
          <Button variant="outline" size="icon-lg">
            <ListIcon weight="bold" />
          </Button>
          <div className="flex gap-2 *:basis-1/2 w-64">
            <Button variant="outline" size="lg">Contact Me</Button>
            <Button size="lg">Got a Project?</Button>
          </div>
        </div>
      </div>
    </main>
  );
}