"use client";

import HashScrollHandler from "@/components/HashScrollHandler";
import AboutHero from "@/components/about/AboutHero";
import Competence from "@/components/about/Competence";
import Tools from "@/components/about/Tools";
import Adaptability from "@/components/about/Adaptability";
import AboutContact from "@/components/about/AboutContact";
import { useLoading } from "@/components/providers/LoadingContext";
import Clients from "@/components/about/AboutClients";
import ScrollAnimation from "@/components/ScrollAnimation";

export default function AboutClient() {
  const { loading } = useLoading();

  return (
    <div>
      <HashScrollHandler />
      <AboutHero ready={!loading} />
      <Competence />
      <Clients />
      <ScrollAnimation ready={!loading} />
      <Tools />
      <Adaptability />
      <AboutContact />
    </div>
  );
}
