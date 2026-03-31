"use client";

import { useLoading } from "@/components/providers/LoadingContext";
import Hero from "@/components/Hero";
import Product from "@/components/Product";
import Clients from "@/components/Clients";
import ScrollAnimation from "@/components/ScrollAnimation";
import Projects from "@/components/Projects";
import BrandStats from "@/components/BrandStats";
import ContactsRef from "@/components/ContactsRef";

export default function Home() {
  const { loading } = useLoading();

  return (
    <div>
      <Hero ready={!loading} />
      <Product />
      <Clients />
      <ScrollAnimation ready={!loading} />
      <Projects />
      <BrandStats>
        <ContactsRef
          scrollTriggerSelector="#stats-contact-section"
          scrollTriggerStart="84% top"
        />
      </BrandStats>
    </div>
  );
}
