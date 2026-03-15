"use client";

import { useLoading } from "@/components/providers/LoadingContext";
import Hero from "@/components/Hero";
import Product from "@/components/Product";
import Partners from "@/components/Partners";
import Projects from "@/components/Projects";
import BrandStats from "@/components/BrandStats";
import ContactsRef from "@/components/ContactsRef";
import PartnersAnimation from "@/components/PartnersAnimation";

export default function Home() {
  const { loading } = useLoading();

  return (
    <div className="*:relative *:z-1">
      <Hero ready={!loading} />
      <Product />
      <Partners />
      <PartnersAnimation ready={!loading} />
      <Projects />
      <BrandStats>
        <ContactsRef />
      </BrandStats>
    </div>
  );
}
