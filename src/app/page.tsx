"use client";
import { useState } from "react";
import Preloader from "../components/Preloader";
import { ComponentExample } from "@/components/component-example";

export default function Home() {
  const [loading, setLoading] = useState(true);

  return (
    <main>
      {loading && <Preloader setComplete={() => setLoading(false)} />}

      <div className={`bg-red-500 transition-all duration-1400 ${loading ? "opacity-0" : "opacity-100"}`}>
        {/* Your actual website content goes here */}
        <ComponentExample />
        <section>
          <h1 className="text-4xl font-bold text-black">ENGINEERING ISN'T JUST ABOUT WRITING CODE...</h1>
        </section>
      </div>
    </main>
  );
}