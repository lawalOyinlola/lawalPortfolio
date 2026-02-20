"use client";
import { useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import LogoButton from "@/components/LogoButton";
import { ComponentExample } from "@/components/component-example";
import { Button } from "@/components/ui/button";
import { ListIcon } from "@phosphor-icons/react";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div className={`transition-opacity duration-1000 ${loading ? "opacity-0 invisible" : "opacity-100 visible"}`}>
        <div className="fixed top-4 left-4 z-99 ">
          <LogoButton />
        </div>

        <Hero />
        <ComponentExample />

        {/* Minimal Nav at bottom of the page */}
        <div className="fixed inset-x-0 bottom-0 p-4.5 flex justify-between items-center text-xs font-mono uppercase tracking-widest text-primary/60 z-999">
          <Button variant="outline" size="icon-lg">
            <ListIcon weight="bold" />
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" size="lg">Contact Me</Button>
            <Button size="lg">Got a Project?</Button>
          </div>
        </div>
      </div>
    </main>
  );
}