"use client";
import { useState } from "react";
import Link from "next/link";
import Preloader from "./components/Preloader";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main>
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div className={`bg-red-500 transition-all duration-1400 ${loading ? "opacity-0" : "opacity-100"}`}>
        {/* Your actual website content goes here */}
        <nav className="flex justify-between items-center p-4">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <section>
          <h1 className="text-4xl font-bold text-black">ENGINEERING ISN'T JUST ABOUT WRITING CODE...</h1>
        </section>
      </div>
    </main>
  );
}