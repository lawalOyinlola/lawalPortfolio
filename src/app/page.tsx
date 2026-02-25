"use client";
import { useLoading } from "@/components/providers/LoadingContext";
import Hero from "@/components/Hero";
import Product from "@/components/Product";
import Partners from "@/components/Partners";
import Projects from "@/components/Projects";

export default function Home() {
  const { loading } = useLoading();

  return (
    <div>
      <Hero ready={!loading} />
      <Product />
      <Partners />
      <Projects />
    </div>
  );
}
