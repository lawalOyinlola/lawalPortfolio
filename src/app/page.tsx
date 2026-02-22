"use client";
import { useState } from "react";
import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import LogoButton from "@/components/LogoButton";
import { Button } from "@/components/ui/button";
import { ListIcon } from "@phosphor-icons/react";
import Footer from "@/components/Footer";
import Product from "@/components/Product";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-clip">
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div
        className={`transition-opacity duration-1000 ${loading ? "opacity-0 invisible" : "opacity-100 visible"}`}
      >
        <div className="fixed top-4.5 left-4.5 z-9999">
          <LogoButton />
        </div>

        <Hero />
        <Product />
        <Projects />
        <Footer />

        {/* Minimal Nav at bottom of the page */}
        <div className="fixed inset-x-0 bottom-0 p-4.5 flex justify-between items-center z-99">
          <Button variant="outline" size="icon-lg" aria-label="Open menu">
            <ListIcon weight="bold" />
          </Button>
          <div className="flex gap-2 *:basis-1/2 w-64">
            <Button variant="outline" size="lg">
              Contact Me
            </Button>
            <Button size="lg">Got a Project?</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
